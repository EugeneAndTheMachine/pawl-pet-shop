# Pawl — Cửa hàng online cho chó mèo

Đồ án môn Electronic Commerce (CO3027). Website B2C bán thức ăn, cát vệ sinh, snack, dinh dưỡng bổ sung và phụ kiện cho chó mèo.

| Phần | Công nghệ | Địa chỉ khi chạy local |
|---|---|---|
| Backend + Admin | Medusa v2 (Node.js, TypeScript) | http://localhost:9000, Admin: http://localhost:9000/app |
| Storefront | Vite + React 19 + TypeScript + Tailwind CSS v4 | http://localhost:5173 |
| Database | Supabase PostgreSQL (Session pooler) | — |
| Ảnh sản phẩm | Supabase Storage (bucket `pawl-media`, giao thức S3) | — |

Không dùng Docker, không cần Redis ở Phase 1.

## Yêu cầu

- **Node.js 20.19+ hoặc 22.12+** (khuyến nghị Node 22 LTS), npm 10+
- Tài khoản [Supabase](https://supabase.com) (gói Free là đủ)
- Git

## Cài đặt từ đầu

### 1. Tạo project Supabase

Làm theo [docs/supabase-setup.md](docs/supabase-setup.md): tạo project (region Singapore), lấy connection string **Session pooler**, tắt Data API, tạo bucket public `pawl-media`, tạo S3 access key.

### 2. Backend

```bash
cd apps/backend
npm install
cp .env.example .env        # rồi điền DATABASE_URL, S3_*, JWT_SECRET, COOKIE_SECRET
node ./src/scripts/check-db.mjs                # in ra phiên bản Postgres nếu kết nối ổn (chạy được cả khi DB còn trống)
npx medusa db:migrate                          # lần đầu mất vài phút vì DB ở xa (Supabase)
npx medusa exec ./src/scripts/seed.ts          # region VN, thuế, kho, vận chuyển, publishable key
npx medusa exec ./src/scripts/seed-catalog.ts  # 13 danh mục, 36 sản phẩm mẫu, tồn kho
npx medusa user -e admin@pawl.local -p <mat-khau>
npm run dev
```

Mở http://localhost:9000/app và đăng nhập bằng tài khoản admin vừa tạo.

### 3. Storefront

```bash
cd apps/storefront
npm install
cp .env.example .env        # điền VITE_MEDUSA_PUBLISHABLE_KEY (seed.ts in ra key này)
npm run dev
```

Mở http://localhost:5173.

> Chỉ đặt giá trị công khai trong biến `VITE_*` vì chúng bị lộ ra trình duyệt. Không đặt key Supabase nào ở storefront.

## Lưu ý

- **Project Supabase gói Free tự tạm dừng sau 7 ngày không hoạt động.** Trước buổi demo hoặc chấm bài, vào dashboard Supabase kiểm tra project đang chạy (bấm **Restore** nếu bị dừng).
- Gói Free có 1 GB storage: nén ảnh trước khi upload qua Admin (WebP/JPEG, cạnh dài ≤ 1200px, dưới 300 KB).
- Làm việc nhóm trên database dùng chung: chỉ một người chạy seed; ai pull code có migration mới thì chạy `npx medusa db:migrate`.

## Dữ liệu mẫu

Hai script seed chạy lại nhiều lần được: thứ gì đã có thì bỏ qua, không tạo trùng và không ghi đè chỉnh sửa trong Admin.

- `seed.ts`: store "Pawl" chỉ dùng VND; region "Vietnam" thanh toán COD (tự thêm VNPay khi `.env` có key VNPay); giá **đã gồm VAT** (tax-inclusive, thuế suất mặc định 10%, đơn giản hoá cho demo); kho "HCMC Warehouse"; 2 phương thức giao hàng: tiêu chuẩn 30.000₫, nhanh 45.000₫; mã giảm giá demo **`PAWL10`** (giảm 10% cả đơn). Cuối script in ra publishable key để chép vào `apps/storefront/.env`.
- `seed-catalog.ts`: cây danh mục Cats/Dogs, 36 sản phẩm (1–3 biến thể mỗi sản phẩm), collection "Best Sellers", tồn kho tại "HCMC Warehouse". Thuộc tính lọc lưu bằng tag dạng `prefix:value` (`species:`, `life:`, `health:`, `free:`, `form:`); `product.metadata` có `brand`, `ingredients`, `kcal_per_kg`, `feeding_guide`.
- Nội dung hiển thị (tên sản phẩm, danh mục, phương thức giao hàng, giao diện storefront) bằng **tiếng Anh**; tỉnh/thành dùng tên Việt Nam không dấu.
- Tên thương hiệu là thật, nhưng **mô tả, thành phần, kcal và hướng dẫn cho ăn do nhóm tự soạn cho demo**, không phải thông số chính thức của nhà sản xuất. Ảnh là placeholder (placehold.co); ảnh thật upload qua Admin.
- Muốn seed lại từ đầu (ví dụ sau khi đổi tên dữ liệu mẫu): `npx medusa exec ./src/scripts/reset-demo-data.ts confirm` xoá sản phẩm, danh mục, collection, kho và phương thức giao hàng do seed tạo (giữ store, region, publishable key, khuyến mãi, khách hàng và đơn hàng), rồi chạy lại 2 script seed.
- Giá trong Medusa v2 lưu theo đơn vị chính, VND không có phần lẻ: `145000` nghĩa là 145.000₫. ESLint rule `@medusajs/prices-in-major-units` cảnh báo nhầm với VND; đó chỉ là warning, không phải lỗi.

## Tài khoản demo

_(Bổ sung ở M1/M5.)_

## Thanh toán

Storefront có 2 phương thức: **COD** (`pp_system_default`, luôn có) và **VNPay sandbox** (`pp_vnpay_vnpay`, chỉ bật khi có key).

### Bật VNPay sandbox

1. Đăng ký merchant sandbox tại trang đăng ký sandbox của VNPay, nhận `vnp_TmnCode` và `vnp_HashSecret` qua email.
2. Điền vào `apps/backend/.env`: `VNP_TMN_CODE`, `VNP_HASH_SECRET` (các biến `VNP_PAY_URL`, `VNP_API_URL`, `VNP_RETURN_URL` để mặc định khi chạy local).
3. Khởi động lại backend rồi chạy lại `npx medusa exec ./src/scripts/seed.ts` để gắn VNPay vào region "Vietnam".

Thiếu key thì backend không nạp provider VNPay và storefront chỉ hiện COD. Nếu region đã gắn VNPay nhưng máy bạn thiếu key, chọn VNPay sẽ báo "not available" thay vì im lặng.

Luồng: Review → chuyển sang trang VNPay → VNPay trả về `/checkout/result` → backend kiểm tra chữ ký (`GET /store/vnpay/verify`) → storefront hoàn tất giỏ → `/orders/:id/confirmed`. Khi tạo đơn, provider hỏi lại VNPay bằng API `querydr`; nếu sandbox không trả lời được thì dùng kết quả đã kiểm tra chữ ký do route verify/IPN ghi lại. IPN (`GET /hooks/vnpay/ipn`) chỉ chạy khi backend có URL public (deploy hoặc tunnel như cloudflared/ngrok); khi dev không có IPN thì luồng return URL vẫn đủ để demo.

### Thẻ test VNPay sandbox

| Ngân hàng | Số thẻ | Tên chủ thẻ | Ngày phát hành | OTP |
|---|---|---|---|---|
| NCB | `9704198526191432198` | `NGUYEN VAN A` | `07/15` | `123456` |

Thông tin thẻ test có thể thay đổi, kiểm tra lại trên trang tài liệu sandbox của VNPay.

### Kiểm thử

```bash
cd apps/backend
npm run test:unit    # ký/kiểm tra chữ ký VNPay, route verify + IPN, validate query
```

## Tài liệu khác

- [docs/supabase-setup.md](docs/supabase-setup.md): tạo và cấu hình Supabase
- `docs/setup.md`, `docs/api.md`: bổ sung ở các milestone sau
