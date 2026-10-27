# Pawl — Kế hoạch phát triển và tiến độ

Cập nhật: Oct 26, 2026 · @Viet Nam

Pawl là website B2C bán đồ cho chó mèo (ưu tiên mèo): thức ăn hạt, pate, cát vệ sinh, snack, dinh dưỡng bổ sung, phụ kiện. Điểm khác biệt là **hồ sơ thú cưng → gợi ý sản phẩm** và **đặt hàng định kỳ** 2/4/6 tuần.

Dự án chia làm hai phase:

- **Phase 1 (đang làm):** một cửa hàng online hoàn chỉnh, chạy ổn định, đủ mọi yêu cầu bắt buộc của đồ án (quản lý sản phẩm, giỏ hàng, thanh toán, quản lý đơn, giao hàng, bảo mật).
- **Phase 2 (chỉ làm khi Phase 1 xong):** hồ sơ pet, gợi ý, đặt định kỳ, chatbot Gemini, GHN, admin extension. Phase 1 không code các phần này nhưng cũng không làm gì cản đường chúng.

Hạn nộp: **23:59 ngày 14/11/2026** (Electronic Commerce CO3027).

> Tài liệu này là kế hoạch tổng thể cho cả nhóm và cho báo cáo. Hướng dẫn cài đặt, lệnh chạy và tài liệu kỹ thuật nằm ở `README.md` và thư mục `docs/`.

---

## 1. Tiến độ hiện tại

| Milestone | Nội dung | Kế hoạch | Trạng thái |
| --- | --- | --- | --- |
| M0 | Thiết lập: Supabase, backend Medusa, storefront Vite | 19–21/10 | **Xong** (24/10) |
| M1 | Dữ liệu mẫu: region VN, kho, vận chuyển, danh mục, 20–40 sản phẩm | 22–24/10 | **Xong** (24/10) |
| M2 | Storefront: trang chủ, danh sách, lọc, chi tiết sản phẩm | 25–30/10 | **Xong** (24/10) |
| M3 | Giỏ hàng, checkout, COD + thanh toán online (QR, giả lập) | 31/10–05/11 | **Xong** (25/10) |
| M4 | Tài khoản: đăng ký, đăng nhập, sổ địa chỉ, lịch sử đơn | 06–09/11 | **Xong** (26/10), chờ duyệt + commit |
| M5 | Trang chính sách, SEO, responsive, bảo mật, `pawl-demo`, tài liệu, test | 10–13/11 | Chưa bắt đầu |
| — | Dự phòng, nộp bài | 14/11 | — |
| Phase 2 | Pet, gợi ý, đặt định kỳ, chatbot, GHN, admin extension | Sau M5, nếu còn thời gian | Chưa bắt đầu |

Mỗi milestone kết thúc bằng: typecheck và build không lỗi, chạy thử theo checklist, báo cáo, commit. Chậm tiến độ thì cắt bớt phần trang trí, không dời các yêu cầu bắt buộc.

### 1.1 M0: đã xong

- Node 22.19 (Medusa 2.21 cần `^20.19` hoặc `>=22.12`).
- **Backend** `apps/backend`: Medusa **2.21.2**, tạo bằng `create-medusa-app --skip-db`, không kèm storefront Next.js.
  - `medusa-config.ts`: SSL tới Supabase theo biến `DB_SSL`; File Module dùng `file-s3` (Supabase Storage, `forcePathStyle: true`) khi có S3 key, ngược lại `file-local`; không khai báo Redis.
  - `src/scripts/check-db.mjs` kiểm tra kết nối (chạy độc lập bằng `node`, không cần DB đã migrate); `.env.example` đủ biến (DB, S3, CORS, secret).
  - Typecheck, lint (`@medusajs/eslint-plugin`) và `medusa build` đều chạy qua không lỗi.
- **Storefront** `apps/storefront`: Vite 8 + React 19 + TypeScript (strict) + Tailwind CSS v4, đã cài `@medusajs/js-sdk`, React Router 7, TanStack Query 5, react-hook-form + zod 4.
  - Có khung: SDK, QueryClient, router, header "Pawl", trang chủ tạm, trang 404.
  - Màu và font theo `materials/Color template`.
  - Build và lint không lỗi; dev server chạy được.
- Tài liệu: `README.md`, `docs/supabase-setup.md`. Repo git đã khởi tạo; `.env` bị bỏ qua, chỉ commit `.env.example`.

### 1.2 M0: kết quả kiểm tra trên Supabase (24/10)

- Project `pawl-dev` nằm ở region **`ap-northeast-1` (Tokyo)**, không phải Singapore như kế hoạch. Pooler: `aws-0-ap-northeast-1.pooler.supabase.com:5432`.
- `check-db.mjs`: kết nối được, có TLS, PostgreSQL 17.11.
- Hậu tố `?ssl_mode=disable`: Medusa kết nối được cả khi có và khi không có hậu tố. Giữ hậu tố theo khuyến nghị của tài liệu Medusa.
- `npx medusa db:migrate`: chạy xong, tạo 148 bảng trong schema `public`.
- Tài khoản admin `admin@pawl.local` đã tạo, đăng nhập qua API được.
- Upload ảnh qua S3 file provider của Medusa: file vào đúng bucket `pawl-media`, URL public trả về đúng ảnh. `S3_REGION` phải trùng region của project (`ap-northeast-1`), nếu khác sẽ bị `SignatureDoesNotMatch`.
- `npm run build` của backend và storefront, lint storefront: không lỗi.

- Upload ảnh trên giao diện Admin: ảnh vào `pawl-media`, URL public trả về 200. Data API đã tắt (xác nhận trên dashboard). M0 đã commit.

### 1.3 M1: dữ liệu mẫu (24/10)

- `src/scripts/seed.ts`: store "Pawl" chỉ dùng VND, giá đã gồm VAT (price preference tax-inclusive cho `vnd` và cho region); region "Việt Nam" (`vn`, thanh toán `pp_system_default`, từ M3 thêm `pp_qr_qr` (chuyển khoản QR giả lập)); tax region VN với VAT mặc định 10% (đơn giản hoá cho demo); kho "Kho TP.HCM" nối với provider fulfillment manual và sales channel; fulfillment set + service zone "Toàn quốc"; 2 shipping option giá cố định 30.000₫ / 45.000₫; dùng lại publishable key có sẵn, gắn với sales channel, in key ra console.
- `src/scripts/seed-catalog.ts` + `src/scripts/data/catalog.ts`: 13 danh mục (Mèo 6 nhánh, Chó 5 nhánh), 36 sản phẩm, 65 biến thể, 22 tag theo quy ước mục 6.3 (script báo lỗi nếu tag sai quy ước), collection "Bán chạy" (9 sản phẩm), tồn kho tại "Kho TP.HCM". Biến thể `RC-URINARY-2KG` để tồn kho 0 cho trường hợp hết hàng.
- Cả hai script đã chạy 2 lần: lần 2 không tạo thêm bản ghi, không trùng SKU.
- `GET /store/products` (có publishable key + `region_id`) trả về `calculated_price` bằng `vnd`, `is_calculated_price_tax_inclusive: true` và tồn kho theo biến thể. Không có publishable key thì trả 400.
- Sản phẩm thử "Áo cho chó" (tạo tay ở M0) chỉ có giá EUR nên không có giá VND. Nên xoá trong Admin.

### 1.4 M2: storefront duyệt sản phẩm (24/10)

- **Thiết kế** theo landing page trong `materials/`: header navy, hero "Pawl / The Pal of your Paw", khối "Về Pawl" nền kem, "Sản phẩm của Pawl" 4 thẻ trên nền navy, footer nền kem có thông tin pháp lý demo. Thêm các khối chuẩn B2C: dải cam kết, Bán chạy, Mua theo nhu cầu sức khoẻ, Sản phẩm mới, Đặt định kỳ (sắp ra mắt, tĩnh).
- Ảnh trong `materials/` được nén sang WebP và đặt ở `apps/storefront/src/assets/images/` (tổng khoảng 400 KB, ảnh gốc 6 MB). Logo được cắt sát và có thêm bản chữ tối cho nền sáng; ảnh sản phẩm vệ sinh đã xoá nền caro.
- **Trang danh sách** `/products`, `/c/:handle`, `/search?q=`: lọc theo loài, giai đoạn tuổi, sức khoẻ, "không chứa", dạng sản phẩm (OR trong một nhóm, AND giữa các nhóm qua `$and` + `tag_id` của Store API), khoảng giá, sắp xếp, phân trang; trạng thái bộ lọc nằm trên URL; skeleton, trạng thái rỗng, lỗi; drawer bộ lọc trên mobile.
- **Trang chi tiết** `/products/:handle`: gallery, thương hiệu, tag tiếng Việt, giá theo biến thể, tồn kho (còn / sắp hết / hết), chọn biến thể (lưu `?variant=` trên URL), số lượng, thêm vào giỏ, tab Mô tả / Thành phần / Hướng dẫn cho ăn, sản phẩm cùng danh mục, thanh mua hàng dính đáy trên mobile.
- **Giỏ hàng tối thiểu** (để icon giỏ và mini-cart chạy được): CartProvider lưu `cart_id` trong localStorage, tạo cart theo region VN khi thêm món đầu tiên, sửa số lượng, xoá. Trang `/cart`, mã giảm giá và checkout làm ở M3.
- Đã kiểm tra bằng trình duyệt headless ở 375 px và 1280 px: không tràn ngang, không lỗi console; lọc, sắp xếp giá, đổi biến thể, thêm vào giỏ, 404 đều chạy đúng.
- Giới hạn: Store API không sắp xếp theo giá, nên khi sắp xếp hoặc lọc theo giá storefront tải toàn bộ sản phẩm khớp bộ lọc rồi xử lý phía client (ổn với vài trăm sản phẩm). Link Đăng nhập/Đăng ký, `/cart`, `/checkout`, `/policies/*` sẽ có ở M3–M5.

### 1.5 M3: giỏ hàng, checkout, thanh toán (25/10)

- **Ngôn ngữ:** toàn bộ giao diện storefront và dữ liệu seed (sản phẩm, danh mục, kho, phương thức giao hàng) chuyển sang **tiếng Anh** theo yêu cầu bài nộp; giá vẫn VND, địa chỉ vẫn là tỉnh/thành Việt Nam. Handle danh mục đổi thành `cat`, `dog`, `cat-dry-food`…; `reset-demo-data.ts` xoá dữ liệu seed cũ để seed lại.
- **Giỏ hàng** `/cart` + mini-cart: sửa số lượng, xoá, mã giảm giá (`PAWL10` giảm 10%, tạo trong `seed.ts`; mã sai thì báo lỗi), tạm tính, giảm giá, phí ship, tổng, phần VAT đã gồm.
- **Checkout** `/checkout`: accordion 5 bước Contact → Delivery address → Delivery method → Payment → Review, validate từng bước bằng zod (SĐT VN, 34 tỉnh/thành). Tiến độ suy ra từ chính cart nên F5 vẫn giữ bước; bấm "Edit" để quay lại bước trước, không nhảy cóc được. SĐT liên hệ lưu ở `cart.metadata.contact_phone`. Bước Review bắt buộc tick đồng ý Điều khoản + Chính sách bảo mật.
- **COD:** `cart.complete` → xoá `cart_id` → `/orders/:id/confirmed`. Đơn có trạng thái thanh toán `authorized` (thu khi giao).
- **Thanh toán online = chuyển khoản QR, GIẢ LẬP** (`src/modules/qr-payment`, id `pp_qr_qr`). Ban đầu nhóm làm VNPay sandbox; vì phạm vi đồ án chỉ cần demo nên đã **thay hẳn** bằng luồng QR giả lập (bỏ module VNPay, route verify/IPN và biến `VNP_*`). Trên web, luồng này trông như thanh toán thật:
  - Bước Review → "Continue to payment" → backend tạo phiên mới: nội dung chuyển khoản `PAWL` + 8 ký tự (bỏ ký tự dễ nhầm 0/O, 1/I), số tiền, hạn 15 phút.
  - `/checkout/pay`: ảnh QR tĩnh của nhóm (`materials/Landing Page/QR code.png`), số tiền và nội dung chuyển khoản có nút copy, đồng hồ đếm ngược, 3 bước hướng dẫn, nút "I have completed the transfer" và "Change payment method". QR hết hạn thì mờ đi, có nút "Get a new QR code".
  - `POST /store/qr-payments/confirm` **đóng vai ngân hàng báo đã nhận tiền**: không kiểm tra giao dịch thật; kiểm tra phiên khớp `cart_id` + nội dung chuyển khoản và còn hạn, ghi `paid_at`/`paid_amount` vào payment session rồi chạy `completeCartWorkflow`. Idempotent (gọi lại trả đúng đơn cũ). Body validate bằng zod (strict). Màn hình "Verifying your payment…" chờ khoảng 2,5 giây cho giống thật.
  - `authorizePayment` chỉ chấp nhận phiên đã ghi nhận trả đủ tiền, trả `captured` (Admin hiện "Paid"). Chưa trả mà gọi `cart.complete` thì bị từ chối. Hoàn tiền giả lập (chỉ log). Mọi bước đều ghi log (mã, số tiền, thời gian).
- **`/orders/:id/confirmed`:** mã đơn, trạng thái thanh toán, địa chỉ, phương thức giao, phương thức thanh toán, sản phẩm, tổng; Guest thấy gợi ý "Create an account with this email".
- **Subscriber:** `order.placed` gửi email xác nhận qua Notification provider `local` (in ra console). Đã có sẵn subscriber reset mật khẩu và `AuthProvider` (dùng cho M4).
- **Kiểm thử:**
  - 12 unit test (`npm run test:unit`): mã chuyển khoản, hạn 15 phút, chỉ authorize khi trả đủ; route confirm (thành công, idempotent, sai mã, hết hạn, lỗi tạo đơn) và validate body chạy qua middleware thật của Medusa.
  - Store API: đơn COD có `PAWL10` (tổng đúng 154.200₫); đơn QR: chưa confirm thì `cart.complete` bị từ chối, confirm → đơn `captured`, confirm lần 2 → cùng đơn, body có trường lạ → 400.
  - Chrome headless ở 1280px và 375px: COD, QR thành công, QR → đổi sang COD; ảnh QR tải được, không tràn ngang, không lỗi console.
  - Typecheck, lint, build của 2 app không lỗi.
- **Còn lại:** Link Sign in/Sign up/Account trên header và link chính sách ở bước Review sẽ có trang ở M4–M5. Trạng thái QR hết hạn mới kiểm tra bằng unit test, chưa chạy thử trên trình duyệt (cần chờ 15 phút).

### 1.6 M4: tài khoản khách hàng (26/10)

- **Đăng ký** `/register`: họ, tên, email, SĐT (regex SĐT VN), mật khẩu ≥ 8 ký tự + nhập lại, checkbox đồng ý Điều khoản và xử lý dữ liệu cá nhân (bắt buộc). Luồng theo tài liệu Medusa: `sdk.auth.register` → `sdk.store.customer.create` (gửi kèm token đăng ký) → `sdk.auth.login`. Thời điểm đồng ý lưu ở `customer.metadata.data_consent_at` (bằng chứng đồng ý theo Luật BVDLCN). Email đã có tài khoản thì báo và gợi ý đăng nhập / quên mật khẩu. `?email=` điền sẵn email (dùng cho nút "Create account" ở trang xác nhận đơn của Guest).
- **Đăng nhập** `/login` hỗ trợ `?redirect=`; chỉ nhận đường dẫn nội bộ (bắt đầu bằng `/`, không phải `//`) để tránh open redirect. Sai mật khẩu báo chung "email hoặc mật khẩu không đúng". Đã đăng nhập mà vào `/login`, `/register` thì chuyển thẳng tới đích.
- **Quên / đặt lại mật khẩu:** `/forgot-password` → `POST /auth/customer/emailpass/reset-password` → subscriber in link ra console → `/reset-password?token=&email=`. Trang luôn báo "nếu email tồn tại…" để không lộ email nào có tài khoản. Token hết hạn sau 15 phút (mặc định của Medusa) và chỉ dùng được một lần (đã kiểm tra: dùng lại trả 401).
- **Sau đăng nhập / đăng ký:** giỏ hàng hiện tại được gắn vào tài khoản (`sdk.store.cart.transferCart`). Đăng xuất thì xoá session và quên giỏ trên máy.
- **`/account`** (guard `RequireAuth`, chưa đăng nhập thì chuyển `/login?redirect=…`): sidebar Overview / Orders / Profile / Addresses / Sign out (trên mobile thành thanh tab cuộn ngang).
  - Overview: lời chào, thông tin cá nhân, địa chỉ mặc định, 3 đơn gần nhất.
  - Profile: sửa họ tên, SĐT; email chỉ đọc; đổi mật khẩu qua link reset.
  - Addresses: thêm/sửa (drawer), xoá (xác nhận ngay trên thẻ, không dùng hộp thoại trình duyệt), đặt mặc định; xoá địa chỉ mặc định thì địa chỉ còn lại tự thành mặc định.
  - Orders: danh sách phân trang 10 đơn (mã, ngày, số món, tổng, trạng thái thanh toán và giao hàng); chi tiết có timeline (Đặt hàng → Đã thanh toán → Đóng gói → Đã gửi → Đã giao; đơn COD thì "Đã thu tiền mặt" ở cuối), địa chỉ, phương thức, sản phẩm, tổng và nút **Buy again** (thêm lại toàn bộ sản phẩm với giá hiện tại; món đã ngừng bán hoặc hết hàng thì bỏ qua và báo).
- **Checkout** cho Customer: tự điền email/SĐT, chọn địa chỉ trong sổ (mặc định chọn sẵn), có tuỳ chọn lưu địa chỉ mới vào sổ.
- **Sửa lỗi phát hiện khi test:** sau khi đăng nhập, React Query trả lại giá trị `null` đã cache (chưa gọi lại `/store/customers/me`) nên giao diện không nhận ra đã đăng nhập; đăng xuất từ trang tài khoản bị guard đẩy sang `/login` (React Router chạy điều hướng trong transition) → dùng `navigate('/', { flushSync: true })` và `RouterProvider` từ `react-router/dom`; tràn ngang ở 375px do lưới 1 cột.
- **Kiểm thử:** Store API bằng `curl` (đăng ký, session, reset mật khẩu, token dùng lại bị từ chối); Chrome headless 27 bước: guard, giỏ Guest giữ nguyên sau đăng ký, F5 giữ đăng nhập, sửa profile, thêm 2 địa chỉ + đổi mặc định, checkout COD bằng địa chỉ đã lưu, đơn hiện trong `/account/orders`, timeline, Buy again, 5 trang tài khoản ở 375px không tràn ngang, đăng xuất, sai mật khẩu, `?redirect=`, chặn redirect ra ngoài, email trùng, quên mật khẩu. Typecheck, lint, build storefront không lỗi.
- **Còn lại:** link Điều khoản / Chính sách bảo mật ở form đăng ký và checkout trỏ tới `/policies/*`, trang này làm ở M5.

### 1.7 Thay đổi so với kế hoạch ban đầu (15/10)

| Kế hoạch cũ | Hiện tại | Lý do |
| --- | --- | --- |
| Pet, gợi ý, đặt định kỳ, GHN đều là Must của MVP | Tách thành Phase 2 | Ưu tiên một cửa hàng chạy ổn định, đủ yêu cầu bắt buộc trước |
| Dev bằng Docker `postgres:16`, deploy lên Supabase/Neon | **Supabase từ đầu**, không Docker | Cả nhóm dùng chung một DB và cùng thấy ảnh; máy nào cũng chạy được |
| Ảnh lưu `file-local` lúc dev | Supabase Storage ngay từ đầu | Như trên |
| Monorepo workspace + `packages/shared` | Hai app độc lập, mỗi app một lockfile, dùng npm | Tránh xung đột dependency của Medusa |
| `create-medusa-app` tạo backend phẳng | Bản mới sinh monorepo Turborepo, nhóm đã tách lại thành `apps/backend` độc lập | Giữ đúng quyết định "không workspace" |
| Starter có migration script seed dữ liệu châu Âu | Đã bỏ | Script này tự chạy khi `db:migrate`, sẽ đụng với seed region VN |
| Model `ProductProfile` lưu thuộc tính dinh dưỡng | **Product tag** `prefix:value` + `product.metadata` | Lọc được ngay bằng Store API có sẵn, không cần module riêng ở Phase 1 |
| Địa chỉ lấy theo danh mục địa giới của GHN | Danh sách 34 tỉnh/thành (sau sáp nhập 2025) đặt trong storefront | GHN chuyển sang Phase 2 |
| Giao hàng GHN | 2 phương thức giá cố định (provider manual) | Như trên |
| Tra cứu đơn cho Guest, quiz | Không làm ở Phase 1 | Giảm phạm vi |
| `@hookform/resolvers` bản mới nhất | Bản 5 | Bản 6 xung đột peer dependency (`effect`) |
| Font phụ đề "Figma Hand" | **Patrick Hand** (Google Fonts) | Figma Hand không có trên Google Fonts; Patrick Hand cùng phong cách viết tay và hỗ trợ tiếng Việt |
| Nút bấm màu `#F18926` chữ trắng | Nút dùng `#B8590B` (cùng tông cam, đậm hơn); `#F18926` giữ cho tiêu đề, badge, điểm nhấn | Chữ trắng trên `#F18926` chỉ đạt tương phản 2,5:1; `#B8590B` đạt 4,8:1 (chuẩn WCAG AA) |
| Mục "My Pet" trên menu (mockup) | Thay bằng nút chuyển Mèo / Chó | Hồ sơ pet thuộc Phase 2 |
| Giao diện và dữ liệu mẫu tiếng Việt | **Tiếng Anh** (giá VND, địa chỉ Việt Nam) | Bài nộp yêu cầu tiếng Anh |
| Thanh toán online qua VNPay sandbox | **Chuyển khoản QR giả lập** (ảnh QR tĩnh, xác nhận giả lập) | Phạm vi đồ án chỉ cần demo; không phụ thuộc tài khoản merchant, không cần URL public cho IPN; tài liệu ghi rõ là giả lập |

---

## 2. Actor

| Actor | Mô tả | Phase 1 | Phase 2 thêm |
| --- | --- | --- | --- |
| Guest | Chưa đăng nhập | Xem, tìm, lọc sản phẩm; giỏ hàng; checkout bằng email + SĐT | Quiz gợi ý nhanh, tra cứu đơn, chatbot |
| Customer | Đã đăng nhập | Như Guest + tài khoản, sổ địa chỉ, lịch sử đơn, mua lại | Hồ sơ pet, gợi ý cá nhân hoá, đặt định kỳ |
| Admin | Nhân viên cửa hàng | Dùng **Medusa Admin có sẵn** (`/app`): sản phẩm, ảnh, biến thể, giá, tồn kho, đơn, khách, khuyến mãi | Widget thuộc tính dinh dưỡng, trang Subscriptions, Analytics |

Guest và Customer là cùng một người ở hai trạng thái trên cùng một storefront. Trong sơ đồ use case, Customer kế thừa Guest; ngân hàng (giả lập), dịch vụ email (và Phase 2: GHN, Gemini) là actor phụ.

Không thêm actor khác: không Shipper (đơn vị vận chuyển lo), không Seller (B2C một người bán), không Bác sĩ thú y.

---

## 3. Phạm vi

### 3.1 Phase 1 (đang làm)

| Chức năng | Cách làm |
| --- | --- |
| Danh mục, tìm kiếm, lọc theo tag/danh mục, sắp xếp, phân trang | Store API của Medusa; bộ lọc nằm trên URL |
| Chi tiết sản phẩm, biến thể (400g / 1.5kg…), giá VND, còn/hết hàng | Store API, `calculated_price` theo region VN |
| Giỏ hàng, sửa số lượng, xoá, mã giảm giá | Cart + Promotion có sẵn; `cart_id` lưu trong localStorage |
| Checkout 1 trang, 5 bước | Liên hệ → địa chỉ → giao hàng → thanh toán → xác nhận |
| Thanh toán **COD** + **chuyển khoản QR (giả lập)** | COD: `pp_system_default`; QR: payment provider tự viết `pp_qr_qr`, xác nhận thanh toán là giả lập |
| Giao hàng: tiêu chuẩn 30.000₫, nhanh 45.000₫ | Provider fulfillment manual có sẵn |
| Đăng ký, đăng nhập, đăng xuất, quên mật khẩu | Auth emailpass của Medusa; email in ra console |
| Tài khoản: tổng quan, thông tin, sổ địa chỉ, đơn hàng | Store API customer/order |
| Chính sách, giới thiệu, liên hệ, 404, footer pháp lý | Nội dung tĩnh (Markdown); thông tin doanh nghiệp là dữ liệu demo |
| Quản trị | Medusa Admin; ảnh upload lên Supabase Storage |
| Responsive mobile-first, SEO cơ bản, accessibility cơ bản | 375 / 768 / 1280px |

### 3.2 Phase 2 (chưa code)

| Chức năng | Ghi chú |
| --- | --- |
| Module `pet` + trang `/account/pets` | Ảnh pet lưu qua File Module (Supabase Storage) |
| Gợi ý sản phẩm theo pet (rule-based, có lý do) | Xem mục 8 |
| Module `subscription`: đặt định kỳ 2/4/6 tuần | Xem mục 9 |
| GHN fulfillment provider (`GHN_MODE` = `mock` hoặc `sandbox`) | Tính phí theo địa chỉ, tạo vận đơn |
| Chatbot Gemini (`POST /store/chat`) | Model đặt qua env `GEMINI_MODEL`, key chỉ ở backend |
| Admin extension: widget dinh dưỡng, Subscriptions, Analytics | Analytics cũng phục vụ KPI Part 2.4 |
| Quiz cho Guest, tra cứu đơn cho Guest | P1 trong Phase 2 |
| Đăng nhập Google, đánh giá sản phẩm, wishlist, blog | Chỉ làm nếu dư thời gian |
| Trừ tiền thẻ tự động, app mobile, nhiều người bán | Roadmap sau đồ án, ghi vào báo cáo |

Phase 1 đã chừa đường cho Phase 2: thuộc tính lọc lưu bằng tag theo quy ước cố định (mục 6.3), `product.metadata` có sẵn `brand`, `ingredients`, `kcal_per_kg`, `feeding_guide`, và `line_item.metadata.subscription` được dành riêng cho đặt định kỳ.

---

## 4. Kiến trúc và hạ tầng

```
 Khách (trình duyệt) ──► Storefront  Vite + React  :5173 ─┐
 Nhân viên ───────────► Medusa Admin  /app ──────────────┤
                                                         ▼
                                   Medusa v2 backend  :9000
                                   (API, workflow, provider QR giả lập)
                                     │            │
                                     ▼            ▼
                           Supabase Postgres  Supabase Storage
                           (Session pooler,   (S3 API, bucket
                            SSL)               public pawl-media)
```

- Storefront và Admin **chỉ nói chuyện với Medusa**. Storefront không gọi Supabase trực tiếp, không dùng `@supabase/supabase-js`.
- Supabase **chỉ** là nơi chứa database Postgres và ảnh. Không dùng Supabase Auth, Data API (đã tắt), anon key hay `service_role` key. Bảng do migration của Medusa tạo ra.
- Mọi khoá bí mật (DB, S3; Phase 2: GHN, Gemini) chỉ nằm ở `apps/backend/.env`. Storefront chỉ có `VITE_MEDUSA_URL` và publishable key của Medusa.
- Thanh toán online là **giả lập**: không có ngân hàng hay cổng thanh toán bên ngoài. Storefront hiện QR tĩnh; route `POST /store/qr-payments/confirm` thay cho thông báo của ngân hàng, ghi nhận đã trả rồi mới tạo đơn.

| Thành phần | Dev | Demo / deploy | Ghi chú |
| --- | --- | --- | --- |
| PostgreSQL | Supabase `pawl-dev` (Tokyo `ap-northeast-1`, Session pooler 5432) | Supabase `pawl-demo` | Gói Free: 500 MB DB; tự tạm dừng sau 7 ngày không hoạt động |
| Ảnh | Supabase Storage (`file-s3`) | Như dev | Gói Free: 1 GB; nén ảnh ≤ 1200px, < 300 KB |
| Redis | Không dùng (Medusa dùng bản in-memory) | Thêm Upstash nếu cần (job Phase 2, nhiều instance) | |
| Backend + Admin | `npm run dev` | Railway / Render / VPS (chọn ở M5) | Cookie session cần xem lại khi 2 app khác domain |
| Storefront | `npm run dev` | Vercel / Netlify (SPA tĩnh) | Rewrite mọi route về `index.html` |
| Thanh toán online | QR giả lập | QR giả lập | Không cần tài khoản merchant hay URL public |
| Email | Notification provider `local` (in ra console) | Như dev, hoặc SendGrid/Resend ở Phase 2 | |

Chi phí gói Free của Supabase và hosting đưa vào phần ước tính chi phí của Part 2.4.

### 4.1 Tech stack đã chốt

| Phần | Công nghệ (phiên bản đang dùng) |
| --- | --- |
| Backend | Medusa v2.21.2, Node.js, TypeScript |
| Storefront | Vite 8, React 19, TypeScript 7 (strict) |
| Routing / data / form | React Router 7 (thư viện), TanStack Query 5, react-hook-form 7 + zod 4 |
| Styling | Tailwind CSS v4 (token màu/font trong `globals.css`) |
| Gọi API | `@medusajs/js-sdk` (auth kiểu session) |
| Thanh toán | COD + chuyển khoản QR (giả lập) |
| Thiết kế | Màu `#F18926` (nhấn), `#395686` (nền phụ), `#413333` (chữ), `#F4EBDD` (nền); font Pacifico (logo/tiêu đề), Inter (nội dung) |

---

## 5. Danh sách trang storefront

| # | Trang | Route | Actor | Phase |
| --- | --- | --- | --- | --- |
| 1 | Trang chủ | `/` | Guest, Customer | 1 (M2) |
| 2 | Danh sách + tìm kiếm | `/products`, `/c/:categoryHandle`, `/search?q=` | Guest, Customer | 1 (M2) |
| 3 | Chi tiết sản phẩm | `/products/:handle` | Guest, Customer | 1 (M2) |
| 4 | Giỏ hàng | `/cart` + mini-cart | Guest, Customer | 1 (M3) |
| 5 | Checkout | `/checkout` | Guest, Customer | 1 (M3) |
| 6 | Kết quả thanh toán / xác nhận đơn | `/checkout/result` → `/orders/:id/confirmed` | Guest, Customer | 1 (M3) |
| 7 | Đăng nhập / đăng ký / quên & đặt lại mật khẩu | `/login`, `/register`, `/forgot-password`, `/reset-password` | Guest | 1 (M4) |
| 8 | Tài khoản: tổng quan, thông tin, địa chỉ | `/account`, `/account/profile`, `/account/addresses` | Customer | 1 (M4) |
| 9 | Đơn hàng + chi tiết | `/account/orders`, `/account/orders/:id` | Customer | 1 (M4) |
| 10 | Chính sách, giới thiệu, liên hệ, 404 | `/policies/:slug`, `/about`, `/contact`, `*` | Guest, Customer | 1 (M5) |
| 11 | Hồ sơ pet + gợi ý | `/account/pets`, `/account/pets/new`, `/account/pets/:id` | Customer | 2 |
| 12 | Đặt định kỳ | `/account/subscriptions`, `/account/subscriptions/:id` | Customer | 2 |
| 13 | Quiz, tra cứu đơn, chatbot | `/quiz`, `/order-lookup`, widget | Guest, Customer | 2 |

Trang 1–5 trùng đúng danh sách UI mà Part 3.1 yêu cầu.

---

## 6. Đặc tả Phase 1

### 6.1 Trang chủ
Header (logo, ô tìm kiếm, chuyển Mèo/Chó, giỏ có số lượng, menu tài khoản); hero + nút "Mua ngay"; lưới danh mục nổi bật; "Sản phẩm mới"; "Bán chạy" (collection chọn tay trong Admin); khối "Đặt định kỳ (sắp ra mắt)" là nội dung tĩnh; footer pháp lý.

### 6.2 Danh sách sản phẩm
- Lọc: loài, giai đoạn tuổi, nhu cầu sức khoẻ, "không chứa", dạng sản phẩm (đều lọc qua `tag_id`); khoảng giá (lọc phía client trên trang hiện tại).
- Sắp xếp: mới nhất, giá tăng/giảm (sort phía client nếu Store API chưa hỗ trợ).
- Phân trang `limit/offset`; skeleton khi tải, trạng thái rỗng, lỗi; bộ lọc nằm trên URL để chia sẻ link.

### 6.3 Quy ước tag (Phase 2 dựa vào đây)

| Prefix | Giá trị |
| --- | --- |
| `species:` | `cat`, `dog` |
| `life:` | `kitten`, `puppy`, `adult`, `senior`, `all` |
| `health:` | `urinary`, `hairball`, `sensitive-stomach`, `weight-control`, `skin-coat`, `dental`, `sterilised` |
| `free:` | `chicken`, `beef`, `fish`, `grain` ("không chứa …") |
| `form:` | `dry`, `wet`, `litter`, `treat`, `supplement`, `accessory` |

Storefront hiển thị nhãn tiếng Việt cho từng tag. `product.metadata`: `brand`, `ingredients`, `kcal_per_kg`, `feeding_guide`.

### 6.4 Chi tiết sản phẩm
Gallery, tên, thương hiệu, giá, chọn biến thể, số lượng, còn/hết hàng, "Thêm vào giỏ"; tab Mô tả / Thành phần / Hướng dẫn cho ăn (từ metadata); sản phẩm cùng danh mục. Đổi biến thể thì giá và tồn kho đổi theo.

### 6.5 Giỏ hàng và checkout
- Cart tạo theo region VN khi thêm sản phẩm đầu tiên; cart đã `completed` hoặc không tìm thấy thì tạo mới.
- Checkout dạng accordion 5 bước, validate từng bước bằng zod:
  1. **Liên hệ:** email, SĐT (regex SĐT VN). Customer tự điền.
  2. **Địa chỉ:** họ tên, SĐT, tỉnh/thành (34 đơn vị), phường/xã, số nhà và đường. Map vào Medusa: `province` = tỉnh/thành, `city` = phường/xã, `address_1` = số nhà và đường, `country_code` = `vn`.
  3. **Giao hàng:** chọn 1 trong 2 phương thức giá cố định.
  4. **Thanh toán:** COD hoặc chuyển khoản QR (giả lập).
  5. **Xác nhận:** tóm tắt, tick đồng ý Điều khoản và Chính sách bảo mật, đặt hàng.
- COD: hoàn tất cart → `/orders/:id/confirmed`. QR: `/checkout/pay` → khách bấm đã chuyển khoản → xác nhận giả lập → tạo đơn → `/orders/:id/confirmed`. Chưa xác nhận hoặc QR hết hạn thì không tạo đơn, giỏ vẫn còn; có thể lấy QR mới hoặc đổi sang COD.

### 6.6 Thanh toán online (chuyển khoản QR, giả lập)
- **Đây là thanh toán giả lập**, chỉ dùng cho demo đồ án. Không gọi ngân hàng hay cổng thanh toán nào, không đối soát tiền thật. Khi demo không chuyển tiền thật.
- Payment Module Provider tự viết `pp_qr_qr`: mỗi phiên có nội dung chuyển khoản `PAWLxxxxxxxx`, số tiền VND, hạn 15 phút; đổi tổng tiền thì phát hành mã mới.
- Storefront `/checkout/pay` hiện ảnh QR tĩnh, số tiền, nội dung chuyển khoản, đồng hồ đếm ngược.
- `POST /store/qr-payments/confirm { cart_id, reference }` giả lập thông báo "đã nhận tiền" của ngân hàng: kiểm tra phiên khớp và còn hạn → ghi nhận đã trả đủ → tạo đơn (idempotent).
- `authorizePayment` chỉ chấp nhận phiên đã trả đủ, trả `captured`. Hoàn tiền giả lập (chỉ log). Mọi bước đều ghi log.
- Nâng cấp lên thanh toán thật: thay route confirm bằng webhook có chữ ký của ngân hàng/cổng thanh toán (VietQR/PayOS, VNPay, MoMo); storefront gần như giữ nguyên.

### 6.7 Tài khoản
- Đăng ký (email, mật khẩu ≥ 8 ký tự, họ tên, SĐT, checkbox đồng ý xử lý dữ liệu cá nhân); đăng nhập có `?redirect=`; quên mật khẩu theo luồng reset của Medusa (link in ra console).
- Sau đăng nhập, gắn giỏ hiện tại vào tài khoản.
- `/account` có guard: Tổng quan (3 đơn gần nhất), Thông tin (sửa tên, SĐT), Địa chỉ (CRUD, mặc định), Đơn hàng (danh sách và chi tiết có timeline, nút "Mua lại").

---

## 7. Cấu trúc thư mục

Hai app độc lập trong một repo, mỗi app có `package.json` và lockfile riêng, dùng npm.

```
pawl/
├── Project.md                    # kế hoạch tổng thể + tiến độ (file này)
├── README.md                     # hướng dẫn cài đặt + chạy (Part 4.2)
├── docs/
│   ├── supabase-setup.md         # đã có
│   ├── setup.md                  # M5
│   └── api.md                    # M5: route custom + luồng checkout
├── materials/                    # màu, font, logo, ảnh landing page, tham khảo
└── apps/
    ├── backend/                  # Medusa v2
    │   ├── medusa-config.ts
    │   ├── integration-tests/
    │   └── src/
    │       ├── api/              # store/qr-payments/confirm, middlewares.ts
    │       ├── modules/qr-payment/  # payment provider QR giả lập + lib/session.ts, confirm.ts
    │       ├── subscribers/      # order-placed, reset password
    │       ├── scripts/          # check-db.mjs, seed.ts, seed-catalog.ts
    │       ├── admin/ jobs/ links/ workflows/   # dùng ở Phase 2
    └── storefront/               # Vite + React
        └── src/
            ├── app/              # router, providers, guards
            ├── pages/            # 1 file = 1 route, chỉ ghép component
            ├── features/         # catalog, cart, checkout, auth, account, orders
            ├── components/       # ui/, layout/
            ├── lib/              # medusa.ts, query-client.ts, format.ts, storage.ts, vn-provinces.ts
            ├── content/policies/ # *.md
            └── styles/globals.css
```

Phase 2 thêm vào backend: `modules/{pet,subscription,recommendation,assistant,ghn}`, `links/`, `workflows/`, `jobs/`, `admin/{widgets,routes}`; storefront thêm `features/{pets,recommendations,subscriptions,chat}`.

---

## 8. Phase 2: gợi ý sản phẩm theo hồ sơ pet

Không cần machine learning: lọc cứng + chấm điểm có trọng số, giải thích được từng gợi ý, không cần dữ liệu lịch sử mua. Gemini chỉ diễn đạt lại kết quả, không tự chọn sản phẩm.

**Model Pet:** name, species, breed, birth_date, sex, neutered, weight_kg, body_condition, activity_level, allergies[], health_conditions[], food_preference, avatar_url; link Customer ↔ Pet.

**Bước 1: lọc cứng.** Khác loài; không hợp giai đoạn tuổi (mèo < 12 tháng là kitten, ≥ 7 tuổi là senior; mốc để trong cấu hình); chứa chất pet dị ứng (dựa trên tag `free:` và metadata `ingredients`); hết hàng; món bé đã đánh giá "Không ăn".

**Bước 2: chấm điểm (thang 100).**

| Tiêu chí | Trọng số |
| --- | --- |
| Nhu cầu sức khoẻ (tag `health:`) | 40 |
| Thể trạng (thừa cân + `weight-control`, triệt sản + `sterilised`) | 15 |
| Dạng thức ăn ưa thích (tag `form:`) | 15 |
| Phản hồi trước đó | 10 |
| Bán chạy 30 ngày | 10 |
| Có đặt định kỳ | 10 |

Mỗi tiêu chí đạt sinh một câu lý do, ví dụ "Không chứa gà — an toàn với dị ứng của Miu". Trọng số để trong cấu hình.

**Bước 3: lượng ăn và tần suất định kỳ.**

```latex
\text{RER} = 70 \times W_{kg}^{0.75} \qquad \text{DER} = \text{RER} \times k \qquad \text{g/ngày} = \frac{\text{DER}}{\text{kcal/kg} / 1000}
```

Hệ số k tham khảo: mèo trưởng thành triệt sản 1.2, chưa triệt sản 1.4, mèo con 2.5; chó triệt sản 1.6, chưa triệt sản 1.8, chó con 3.0. Ví dụ mèo 4 kg đã triệt sản, hạt 3.800 kcal/kg → khoảng 63 g/ngày → gói 1.5 kg dùng khoảng 24 ngày → đề xuất 2 gói mỗi 6 tuần. Giao diện ghi rõ "ước tính tham khảo, không thay tư vấn thú y".

**Chatbot Gemini:** function calling tới `search_products`, `get_recommendations(pet_id)`, `get_order_status`, `get_subscription`; tool chỉ đọc dữ liệu của chính người đang chat; trả lời tiếng Việt, không chẩn đoán bệnh. Tìm kiếm ngữ nghĩa có thể dùng extension `pgvector` có sẵn trên Supabase.

---

## 9. Phase 2: đặt định kỳ

Cách làm: "tạo đơn tự động + thanh toán từng kỳ", không trừ tiền thẻ tự động (theo [Medusa Subscriptions recipe](https://docs.medusajs.com/resources/recipes/subscriptions)).

**Model:** Subscription (status, interval_weeks 2/4/6, discount_pct, next_delivery_date, paused_until, shipping_address, payment_method), SubscriptionItem, SubscriptionCycle (scheduled → skipped | order_created → paid | failed).

**Một kỳ giao:**
1. Đơn đầu: subscriber `order.placed` thấy dòng có `metadata.subscription` → tạo Subscription.
2. T−5 ngày: email nhắc, kèm link sửa/bỏ qua.
3. Trước hạn chốt T−3: khách được bỏ qua, tạm dừng, đổi sản phẩm/tần suất/địa chỉ.
4. Tại hạn chốt: job hằng ngày tạo đơn kỳ mới (giá hiện hành trừ % giảm). COD xử lý ngay; thanh toán online gửi link trang QR, hạn 48 giờ.
5. Quá hạn chưa thanh toán thì kỳ `failed`; 2 kỳ lỗi liên tiếp thì tự tạm dừng gói.

| Cách thanh toán định kỳ | Độ khó | Dùng khi |
| --- | --- | --- |
| COD mỗi kỳ | Thấp | Mặc định |
| Link thanh toán QR mỗi kỳ | Thấp (dùng lại provider) | Phase 2 |
| Token thẻ / trừ tự động | Cao, cần hợp đồng merchant | Roadmap, ghi vào báo cáo |

Khi có job chạy định kỳ và deploy nhiều instance thì cân nhắc thêm Redis (Upstash).

---

## 10. Bảo mật và pháp lý

| Yêu cầu (slide Security) | Việc làm trong Pawl |
| --- | --- |
| Xác thực | Auth emailpass của Medusa (mật khẩu băm); session cookie httpOnly thay vì token trong localStorage |
| Kiểm soát truy cập | Store API chỉ cho chủ đơn xem đơn; route custom tự kiểm tra chủ sở hữu; `STORE_CORS`/`ADMIN_CORS`/`AUTH_CORS` chỉ mở đúng origin; Admin dùng auth admin có sẵn |
| Bí mật | Secret chỉ ở `apps/backend/.env`, không commit; không dùng anon/service_role key của Supabase; biến `VITE_*` chỉ chứa giá trị công khai; DB luôn qua SSL; `JWT_SECRET`/`COOKIE_SECRET` sinh ngẫu nhiên; không lưu số thẻ |
| Toàn vẹn | Chỉ tạo đơn khi phiên thanh toán đã ghi nhận trả đủ đúng số tiền; phiên phải khớp `cart_id` + nội dung chuyển khoản và còn hạn; xác nhận idempotent; validate input route custom bằng zod (strict). Xác nhận thanh toán là giả lập: bản thật cần webhook có chữ ký của ngân hàng |
| Sẵn sàng | Backup tự động của Supabase; kiểm tra project chưa bị tạm dừng trước demo; React Query cache để giảm tải |
| Chống chối bỏ | Log giao dịch thanh toán (mã chuyển khoản, số tiền, kết quả, thời gian); không log mật khẩu, token, connection string |
| Dữ liệu công khai | Supabase Data API đã tắt; bucket `pawl-media` public nên chỉ chứa ảnh công khai |

Pháp lý cần thể hiện trên website và trong báo cáo:

- **Luật Thương mại điện tử số 122/2025/QH15** (hiệu lực 01/7/2026): công khai thông tin hàng hoá và người bán. Footer có tên doanh nghiệp, địa chỉ, MST, liên hệ, các trang chính sách. Pawl dùng dữ liệu demo và ghi rõ "Dự án học tập – không kinh doanh thật".
- **Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15** (hiệu lực 01/01/2026) và **Nghị định 356/2025/NĐ-CP**: checkbox đồng ý xử lý dữ liệu khi đăng ký và khi đặt hàng, trang chính sách bảo mật nêu mục đích sử dụng; Phase 2 thêm xem/tải/xoá dữ liệu và không gửi dữ liệu cá nhân sang Gemini khi không cần.
- Phase 2: điều khoản đặt định kỳ riêng (tần suất, giá, hạn chốt, huỷ bất kỳ lúc nào) và ghi chú "tham khảo, không thay tư vấn thú y" cho gợi ý dinh dưỡng.

---

## 11. Mô hình doanh thu và chiến lược giá (cho Part 2)

| Nguồn thu | Loại (theo slide) | Khi nào |
| --- | --- | --- |
| Biên lợi nhuận bán lẻ | Web catalog | Ngay từ đầu |
| Doanh thu lặp lại từ đặt định kỳ | Web catalog + giữ chân | Khi có Phase 2 |
| Phí ship (dưới ngưỡng miễn phí) | Fee-for-transaction | Ngay từ đầu |
| Món thử / vị trí gợi ý được tài trợ (gắn nhãn "Tài trợ") | Advertising / fee-for-service | Khi đủ lượng khách |
| Gói hội viên (miễn ship, giảm thêm) | Subscription | Sau khi có dữ liệu tần suất mua |

Chiến lược giá:
- **Penetration** cho hàng thiết yếu (cát, hạt phổ biến): giá ngang hoặc thấp hơn chút so với sàn TMĐT.
- **Giảm giá khi đặt định kỳ** (ví dụ 5%) + miễn ship từ kỳ 2: price discrimination bậc 2.
- **Bundling** hạt + cát + pate.
- **Value-based** cho dinh dưỡng bổ sung chuyên biệt.
- Không dùng giá động theo từng người cho hàng thiết yếu, vì khách mua lặp lại dễ nhận ra và mất tin tưởng.

BEP (số đơn/tháng) = chi phí cố định/tháng ÷ lãi gộp trung bình mỗi đơn. Nhóm cần bổ sung: giá nhập thực tế, chi phí cố định (hosting, kho, nhân sự, marketing), giá trị đơn trung bình, tỷ lệ khách chuyển sang đặt định kỳ.

---

## 12. Phân vai đề xuất

| Vai | Phụ trách chính |
| --- | --- |
| BE | Supabase, Medusa, seed (M0–M1), thanh toán QR giả lập (M3), deploy `pawl-demo` (M5); Phase 2: pet, subscription, GHN |
| FE 1 | Layout, trang chủ, danh sách, chi tiết (M2), giỏ, checkout (M3) |
| FE 2 | Auth, tài khoản (M4), trang tĩnh, SEO, responsive (M5) |
| BA / Design | Báo cáo Part 1–2, dữ liệu sản phẩm + ảnh, nội dung chính sách, test, slide, video |

Báo cáo Part 1–2 (thị trường, SWOT, BMC, doanh thu, BEP, marketing, KPI) chạy song song từ bây giờ, không dồn vào cuối.

---

## 13. Đối chiếu yêu cầu đồ án

| Yêu cầu | Điểm | Đáp ứng ở đâu | Phase |
| --- | --- | --- | --- |
| 3.1 UI: Homepage, Product listing, Product detail, Cart, Checkout | 1.0 | Trang 1–5 (mục 5, 6) | 1 |
| 3.2 Nguyên tắc thiết kế | 0.5 | Mobile-first, checkout accordion, bộ màu/font thống nhất, accessibility cơ bản | 1 |
| 4.1 Product management | | Medusa Admin, ảnh trên Supabase Storage | 1 |
| 4.1 Shopping cart | | `/cart` + mini-cart, mã giảm giá | 1 |
| 4.1 Payment (real/simulated) | | COD + chuyển khoản QR **giả lập** | 1 |
| 4.1 Order management | | Medusa Admin Orders + `/account/orders` | 1 |
| 4.1 Delivery options | | 2 phương thức giá cố định; GHN ở Phase 2 | 1 |
| 4.1 Security | | Mục 10 | 1 |
| 4.1 Framework, custom feature, hosting | 1.5 (cả 4.1) | Medusa v2 + Supabase; custom: payment provider QR giả lập (Phase 1), pet/subscription/gợi ý/chatbot (Phase 2) | 1 + 2 |
| 4.2 Source + DB + hướng dẫn cài | 0.5 | `README.md`, `docs/`, script `check-db`/`seed` | 1 |
| 5 Advanced features | 1.0 | Gợi ý theo pet, đặt định kỳ, chatbot Gemini, analytics | **2** |
| 2.1–2.2 Doanh thu, giá, BEP | 2.0 | Mục 11 (cần số liệu của nhóm) | — |
| 2.4 KPI | (trong 1.0) | Số liệu đơn/doanh thu từ Medusa Admin; Phase 2 có trang Analytics | — |

**Rủi ro:** điểm Part 5 phụ thuộc vào Phase 2. Nếu Phase 1 xong đúng hạn M5 thì vẫn còn rất ít thời gian trước 14/11. Nhóm cần quyết định sớm có làm một phần Phase 2 trong thời gian dự phòng không, ưu tiên phần gợi ý theo pet vì Phase 1 đã chuẩn bị sẵn tag và metadata.

---

## Nguồn

- Đề bài: Requirements for Assignment S261 (Electronic Commerce CO3027), slide 03-Pricing, 08-Planning, 09-Security, c5-Payment.
- [Medusa Documentation](https://docs.medusajs.com) (v2.21): cấu hình `databaseDriverOptions`, S3 File Module Provider, migration scripts, Payment Module Provider.
- [Medusa — Subscriptions recipe](https://docs.medusajs.com/resources/recipes/subscriptions)
- [Supabase Documentation](https://supabase.com/docs): Session pooler, Storage S3 compatibility.
- [Gemini API changelog](https://ai.google.dev/gemini-api/docs/changelog)
- [Luật TMĐT 2025 có hiệu lực từ 1/7/2026 — Báo Lào Cai](https://baolaocai.vn/tu-hom-nay-172026-ban-hang-online-khong-the-an-danh-nguoi-ban-can-lam-gi-post902924.html)
- [Nghị định 356/2025/NĐ-CP hướng dẫn Luật Bảo vệ dữ liệu cá nhân — Thư viện Pháp luật](https://thuvienphapluat.vn/van-ban/Quyen-dan-su/Nghi-dinh-356-2025-ND-CP-huong-dan-Luat-Bao-ve-du-lieu-ca-nhan-687428.aspx)
