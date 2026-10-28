# API và luồng nghiệp vụ của Pawl

Storefront chỉ nói chuyện với backend Medusa qua **Store API** (gói `@medusajs/js-sdk`). Không gọi Supabase trực tiếp.

- Mọi request tới `/store/*` gửi header `x-publishable-api-key` (publishable key do `seed.ts` in ra, gắn với sales channel mặc định). Thiếu key thì Medusa trả `400`.
- Đăng nhập khách hàng dùng **session cookie** (`connect.sid`, httpOnly) do `/auth/session` tạo ra. SDK cấu hình `auth: { type: "session" }`, không lưu token trong `localStorage`.
- Giá trả về theo region "Vietnam" (`region_id`), đơn vị **VND, đã gồm VAT** (`is_calculated_price_tax_inclusive: true`).
- Admin dùng **Medusa Admin** có sẵn ở `http://localhost:9000/app` (Admin API `/admin/*`, đăng nhập riêng).

## 1. Route tự viết

### `POST /store/qr-payments/confirm`

Giả lập thông báo "đã nhận tiền" của ngân hàng cho phương thức chuyển khoản QR. **Đây là thanh toán giả lập**: route không kiểm tra giao dịch thật nào.

File: `apps/backend/src/api/store/qr-payments/confirm/route.ts`, logic ở `src/modules/qr-payment/lib/confirm.ts`.

Request (body được kiểm tra bằng zod ở `src/api/middlewares.ts`, có trường lạ thì bị từ chối):

```json
{ "cart_id": "cart_01J...", "reference": "PAWL7K3M9XQ2" }
```

| Trường | Ràng buộc |
|---|---|
| `cart_id` | `cart_` + 26 ký tự ULID |
| `reference` | `PAWL` + 8 ký tự trong bảng chữ không có ký tự dễ nhầm (`0/O`, `1/I`) |

Xử lý:

1. Tìm payment session `pp_qr_qr` của cart có `data.reference` khớp. Không có → `404 not_found`.
2. Cart đã thành đơn → trả lại đúng đơn đó (**idempotent**, gọi lại bao nhiêu lần cũng ra một đơn).
3. Phiên quá hạn (15 phút) → `410 expired`.
4. Ghi `paid_at`, `paid_amount` (bằng đúng số tiền của phiên), `transaction_no` vào `data` của payment session.
5. Chạy `completeCartWorkflow` → provider `authorizePayment` thấy phiên đã trả đủ thì trả `captured` → tạo đơn.
6. Tạo đơn lỗi (ví dụ hết hàng) → `409 failed`, giỏ vẫn giữ nguyên.

Response:

| HTTP | Body |
|---|---|
| 200 | `{ "status": "paid", "order_id": "order_..." }` |
| 400 | Body sai định dạng (lỗi validate của Medusa) |
| 404 | `{ "status": "not_found", "message": "..." }` |
| 409 | `{ "status": "failed", "message": "..." }` |
| 410 | `{ "status": "expired", "message": "..." }` |

Mọi bước đều ghi log qua logger của Medusa (mã chuyển khoản, số tiền, thời gian, mã đơn), không ghi dữ liệu cá nhân hay secret.

Nâng cấp lên thanh toán thật: thay route này bằng webhook có chữ ký của ngân hàng hoặc cổng thanh toán (VietQR/PayOS, VNPay, MoMo…), kiểm tra chữ ký và số tiền rồi gọi đúng logic ở bước 4–5.

## 2. Payment provider `pp_qr_qr`

File: `apps/backend/src/modules/qr-payment/service.ts`, đăng ký trong `medusa-config.ts` (module `@medusajs/medusa/payment`, `id: "qr"`, `options.expiryMinutes = 15`).

| Method | Hành vi |
|---|---|
| `initiatePayment` | Tạo `data = { reference, amount, cart_id, expires_at }`, trạng thái `pending` |
| `updatePayment` | Tổng tiền thay đổi → phát hành mã chuyển khoản mới cho số tiền mới |
| `authorizePayment` | Chỉ `captured` khi `paid_at` có và `paid_amount === amount`; ngược lại `pending` (Medusa không tạo đơn) |
| `capturePayment` | Không làm gì thêm (đã thu khi authorize) |
| `refundPayment` | **Hoàn tiền giả lập**: chỉ ghi log và đánh dấu `simulated_refund` |
| `getPaymentStatus` | `captured` nếu đã trả đủ, ngược lại `pending` |
| `getWebhookActionAndData` | Không hỗ trợ webhook (thanh toán giả lập) |

COD dùng provider có sẵn `pp_system_default`: đơn ở trạng thái thanh toán `authorized`, thu tiền khi giao.

## 3. Luồng checkout (Store API)

| Bước | Lời gọi | Ghi chú |
|---|---|---|
| Thêm món đầu tiên | `POST /store/carts` với `region_id` + `items` | Tạo giỏ kèm món trong một request. `cart_id` lưu ở `localStorage` (`pawl_cart_id`) |
| Thêm món tiếp | `POST /store/carts/:id/line-items` | |
| Sửa / xoá món | `POST` / `DELETE /store/carts/:id/line-items/:line_id` | |
| Mã giảm giá | `POST` / `DELETE /store/carts/:id/promotions` | Mã demo `PAWL10` |
| 1. Liên hệ | `POST /store/carts/:id` `{ email, metadata.contact_phone }` | |
| 2. Địa chỉ | `POST /store/carts/:id` `{ shipping_address, billing_address }` | `province` = tỉnh/thành, `city` = phường/xã, `address_1` = số nhà, đường; `country_code = "vn"` |
| 3. Giao hàng | `GET /store/shipping-options?cart_id=` → `POST /store/carts/:id/shipping-methods` | Danh sách được tải trước ngay khi có địa chỉ |
| 4. Thanh toán | `GET /store/payment-providers?region_id=` → `POST /store/payment-collections` → `POST /store/payment-collections/:id/payment-sessions` | `provider_id`: `pp_system_default` hoặc `pp_qr_qr`, `data.cart_id` |
| 5a. COD | `POST /store/carts/:id/complete` | `type: "order"` → xoá `cart_id`, chuyển tới `/orders/:id/confirmed` |
| 5b. QR | Tạo phiên mới → trang `/checkout/pay` → `POST /store/qr-payments/confirm` | Chưa xác nhận thì `cart.complete` bị từ chối |

Tiến độ checkout suy ra từ chính cart (đã có email? địa chỉ? phương thức giao? payment session?), nên F5 vẫn giữ đúng bước.

## 4. Tài khoản khách hàng

| Việc | Lời gọi |
|---|---|
| Đăng ký | `POST /auth/customer/emailpass/register` → `POST /store/customers` (kèm token đăng ký) → đăng nhập |
| Đăng nhập | `POST /auth/customer/emailpass` → `POST /auth/session` (tạo session cookie) |
| Đăng xuất | `DELETE /auth/session` |
| Gắn giỏ vào tài khoản | `POST /store/carts/:id/customer` (sau khi đăng nhập / đăng ký) |
| Quên mật khẩu | `POST /auth/customer/emailpass/reset-password` → event `auth.password_reset` → subscriber in link ra console → `/reset-password?token=&email=` → `POST /auth/customer/emailpass/update` |
| Hồ sơ | `GET` / `POST /store/customers/me` |
| Sổ địa chỉ | `/store/customers/me/addresses` (GET, POST, POST `:id`, DELETE `:id`) |
| Đơn hàng | `GET /store/orders`, `GET /store/orders/:id` (Medusa chỉ trả đơn của chính khách đang đăng nhập) |

## 5. Subscriber

| Event | File | Việc làm |
|---|---|---|
| `order.placed` | `src/subscribers/order-placed.ts` | Gửi email xác nhận đơn qua Notification provider `local` (in ra console) |
| `auth.password_reset` | `src/subscribers/password-reset.ts` | Gửi link đặt lại mật khẩu (in ra console) |

## 6. Bộ nhớ đệm

Khi `MEDUSA_FF_CACHING=true`, Caching Module của Medusa giữ trong bộ nhớ kết quả truy vấn sản phẩm, region, giá biến thể, phương thức giao hàng, sales channel… Sửa dữ liệu qua Admin của **chính backend đó** thì cache tương ứng bị xoá ngay (qua event). Thay đổi từ nơi khác (backend của thành viên khác trên DB dùng chung, script seed) chỉ hiện ra sau `CACHE_TTL_SECONDS` (mặc định 300 giây). Tồn kho không bị cache. Chi tiết và số đo ở [setup.md](setup.md#hiệu-năng).
