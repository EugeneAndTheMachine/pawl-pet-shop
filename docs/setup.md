# Hướng dẫn cài đặt chi tiết

Tài liệu này đi từng bước từ máy trống tới lúc chạy được cả backend lẫn storefront, cộng với các ghi chú về hiệu năng và lỗi hay gặp. Bản rút gọn nằm ở [README](../README.md).

## 1. Chuẩn bị

| Thứ cần có | Ghi chú |
|---|---|
| Node.js **20.19+ hoặc 22.12+** (khuyến nghị 22 LTS) | Kiểm tra: `node -v` |
| npm 10+ | Đi kèm Node |
| Git | |
| Tài khoản Supabase | Gói Free là đủ |

Không cần Docker, không cần Redis.

```bash
git clone <repo-url> pawl
cd pawl
```

Repo có hai app độc lập, mỗi app một `package.json` và lockfile riêng (không dùng workspace):

```
apps/backend     Medusa v2 (API + Admin), cổng 9000
apps/storefront  Vite + React, cổng 5173
```

## 2. Supabase

Làm theo [supabase-setup.md](supabase-setup.md) để có: `DATABASE_URL` (Session pooler), bucket public `pawl-media`, S3 access key. Nhớ **tắt Data API**.

## 3. Backend

```bash
cd apps/backend
npm install
cp .env.example .env
```

Điền `.env`:

| Biến | Giá trị |
|---|---|
| `DATABASE_URL` | Connection string Session pooler, thêm `?ssl_mode=disable` ở cuối |
| `DB_SSL` | `true` |
| `S3_*` | Theo [supabase-setup.md](supabase-setup.md#6-điền-appsbackendenv) |
| `JWT_SECRET`, `COOKIE_SECRET` | Hai chuỗi ngẫu nhiên khác nhau, tạo bằng `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`. Ở production, backend không chịu khởi động nếu còn để `change-me` |
| `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` | Giữ như mẫu khi chạy local |
| `MEDUSA_FF_CACHING`, `CACHE_TTL_SECONDS`, `DB_POOL_MIN`, `DB_POOL_MAX` | Giữ như mẫu (xem [Hiệu năng](#hiệu-năng)) |

Vì sao có hậu tố `?ssl_mode=disable`: Supabase bắt buộc SSL, nên `medusa-config.ts` bật SSL qua `databaseDriverOptions` theo biến `DB_SSL`. Tài liệu Medusa yêu cầu thêm hậu tố này khi đặt `rejectUnauthorized: false`, để tham số SSL trong URL không đè lên cấu hình của driver. Kết nối vẫn được mã hoá (`check-db.mjs` in ra `TLS: yes`).

Khởi tạo database và dữ liệu mẫu:

```bash
node ./src/scripts/check-db.mjs                # in ra phiên bản Postgres nếu kết nối ổn
npx medusa db:migrate                          # tạo ~148 bảng; lần đầu mất vài phút vì DB ở xa
npx medusa exec ./src/scripts/seed.ts          # store, region VN, thuế, kho, vận chuyển, mã PAWL10, publishable key
npx medusa exec ./src/scripts/seed-catalog.ts  # 13 danh mục, 44 sản phẩm, tồn kho, upload ảnh từ materials/Items
npx medusa user -e admin@pawl.local -p <mat-khau-admin>
npm run dev
```

`seed.ts` in ra dòng `VITE_MEDUSA_PUBLISHABLE_KEY=pk_...` ở cuối; chép lại cho bước 4.

Ảnh sản phẩm lấy từ `materials/Items/<Loài>/<Phân loại>/<tên sản phẩm>.jpg|png` (khai báo ở trường `image` trong `src/scripts/data/catalog.ts`) và được upload lên bucket `pawl-media` khi tạo sản phẩm mới. JPEG, PNG và WebP đều được, có thể để lẫn lộn trong cùng thư mục. Ảnh nào không tìm thấy thì sản phẩm dùng ảnh placeholder và script in cảnh báo. Thư mục `materials/Items` nằm trong `.gitignore` (ảnh đã có sẵn trên Supabase Storage của `pawl-dev`); muốn seed kèm ảnh trên database khác thì chép thư mục này từ máy đã có. Muốn xoá sạch sản phẩm, đơn hàng, giỏ hàng để seed lại catalog (chỉ dùng khi shop chưa vận hành thật):

```bash
npx medusa exec ./src/scripts/clear-catalog-and-orders.ts confirm
npx medusa exec ./src/scripts/seed-catalog.ts
```

Script giữ nguyên store, region, vận chuyển, kho, danh mục, tag, khách hàng, khuyến mãi và tài khoản admin. Backend đang chạy cache danh sách sản phẩm tối đa 5 phút; khởi động lại backend để thấy ngay catalog mới. Mở http://localhost:9000/app và đăng nhập bằng tài khoản admin vừa tạo.

## 4. Storefront

```bash
cd apps/storefront
npm install
cp .env.example .env     # điền VITE_MEDUSA_PUBLISHABLE_KEY
npm run dev
```

Mở http://localhost:5173. Chỉ đặt giá trị công khai trong biến `VITE_*` (chúng nằm trong code gửi xuống trình duyệt).

## 5. Kiểm tra nhanh sau khi cài

1. Trang chủ hiện "Best sellers" và "New arrivals" có giá VND.
2. Thêm một sản phẩm vào giỏ → checkout bằng COD (mã `PAWL10` giảm 10%) → trang "Thank you!".
3. Checkout lại, chọn "Bank transfer (QR)" → bấm "I have completed the transfer" → đơn được tạo (thanh toán **giả lập**).
4. Vào Admin → Orders: thấy 2 đơn, đơn COD "Authorized", đơn QR "Captured/Paid".
5. Đăng ký tài khoản → đơn mới hiện trong `/account/orders`.

## 6. Kiểm thử và build

```bash
# backend
cd apps/backend
npm run test:unit      # 12 test: provider QR + route confirm (chạy qua middleware validate thật)
npx tsc --noEmit
npm run lint           # chỉ còn cảnh báo @medusajs/prices-in-major-units (nhầm với VND, không phải lỗi)
npm run build

# storefront
cd apps/storefront
npm run build          # tsc -b + vite build
npm run lint
```

## 7. Chuyển sang project `pawl-demo`

`pawl-demo` là project Supabase thứ hai, dùng khi quay video, thuyết trình và chấm bài, để dữ liệu demo không bị ảnh hưởng bởi việc phát triển. Tạo theo [supabase-setup.md](supabase-setup.md) (**region Singapore**).

1. Giữ cấu hình hiện tại: `cp apps/backend/.env apps/backend/.env.pawl-dev` và `cp apps/storefront/.env apps/storefront/.env.pawl-dev` (các file `.env.*` đã nằm trong `.gitignore`).
2. Điền `DATABASE_URL`, `S3_*` của `pawl-demo` vào `apps/backend/.env`.
3. Chạy lại toàn bộ mục 3: `check-db` → `db:migrate` → 2 script seed → tạo admin.
4. Chép publishable key mới vào `apps/storefront/.env`.
5. Vào Admin upload ảnh thật cho các sản phẩm hiện ở trang chủ (nén trước: WebP/JPEG, cạnh dài ≤ 1200px, dưới 300 KB).
6. Kiểm tra Data API của `pawl-demo` đã tắt.

Muốn quay lại `pawl-dev` thì chép ngược hai file `.env.pawl-dev`. Mỗi lần đổi DB phải khởi động lại backend.

## Hiệu năng

### Vì sao web chậm khi chạy local

Database nằm trên Supabase, mỗi truy vấn là một lượt đi về qua Internet. Medusa chạy nhiều truy vấn **nối tiếp nhau** trong mỗi request, nên thời gian phản hồi gần như bằng `số truy vấn × độ trễ mạng`. Đo từ máy phát triển ở Việt Nam tới `pawl-dev` (Tokyo, `ap-northeast-1`):

| Thao tác | Số truy vấn DB | Thời gian |
|---|---|---|
| Danh sách region | ~5 | ~0,45 s |
| Danh sách sản phẩm (chưa cache) | ~23 | ~2,5 s |
| Tạo giỏ | ~47 | ~4,2 s |
| Thêm vào giỏ | ~85 | ~8 s |
| Lưu địa chỉ / chọn phương thức giao | — | ~11–16 s |
| Đặt hàng | — | ~9 s |

Một lượt đi về tới Tokyo mất **~105 ms**, tới Singapore (`ap-southeast-1`) chỉ **~35 ms**. Vì vậy `pawl-demo` nên tạo ở **Singapore**: mọi thao tác ghi (giỏ hàng, checkout) sẽ nhanh hơn khoảng 3 lần. Khi deploy thật, đặt backend cùng region với database thì độ trễ mỗi truy vấn chỉ còn 1–2 ms và các thao tác trên đều dưới 1 giây.

### Đã tối ưu

| Thay đổi | Ở đâu | Kết quả đo được |
|---|---|---|
| **Caching Module** của Medusa (in-memory) | `medusa-config.ts`, `MEDUSA_FF_CACHING=true` | Danh sách / chi tiết / tìm kiếm sản phẩm: ~2,5 s → **~0,22 s** (lần đầu sau mỗi 5 phút vẫn ~2 s); region, danh mục, tag: ~0,35 s → ~0,12 s |
| Giữ kết nối DB lâu hơn (`idleTimeoutMillis` 10 phút) | `medusa-config.ts` | Tránh mất ~1,2 s mở lại kết nối TLS sau lúc nghỉ |
| Tải trước trang sản phẩm khi rê chuột / focus vào thẻ | `features/catalog/hooks.ts` (`usePrefetchProduct`) | Mở trang chi tiết từ danh sách: ~2,5 s → **~0,05 s** |
| Tạo giỏ kèm sản phẩm trong một request; số trên icon giỏ cập nhật ngay | `features/cart/api.ts`, `cart-context.tsx` | Lần thêm đầu tiên: ~13,7 s → ~7,7 s; badge phản hồi tức thì |
| Tải trước phương thức giao hàng và thanh toán trong checkout | `features/checkout/queries.ts` | Hai bước này mở ra là có dữ liệu ngay |
| Tách code theo trang (lazy route) | `app/router.tsx` | JS tải lần đầu: 759 KB → ~585 KB (gzip 207 KB → ~161 KB); zod, form, markdown chỉ tải khi cần |
| React Query `staleTime` | `lib/query-client.ts`, `features/*/hooks.ts` | Không gọi lại API khi quay lại trang vừa xem |

### Giới hạn của bộ nhớ đệm

- Cache nằm trong tiến trình backend. Sửa sản phẩm, giá, khuyến mãi trong **Admin của chính backend đó** thì storefront thấy ngay.
- Thay đổi từ máy khác trên database dùng chung, hoặc từ script seed, chỉ hiện ra sau tối đa `CACHE_TTL_SECONDS` (mặc định 300 giây). Cần thấy ngay thì khởi động lại backend.
- Tồn kho không bị cache.
- Medusa đánh dấu tính năng này là thử nghiệm. Thấy dữ liệu sai thì đặt `MEDUSA_FF_CACHING=false` và khởi động lại.
- Khi chạy nhiều instance backend thì dùng provider Redis (`@medusajs/caching-redis`) thay cho bản in-memory.

### Giới hạn kết nối của gói Free

Session pooler gói Free cho **tối đa 15 kết nối cho cả project**, cả nhóm dùng chung. Mỗi backend dùng tối đa `DB_POOL_MAX` (mặc định 5) kết nối, nên tối đa khoảng 2–3 người chạy backend cùng lúc trên `pawl-dev`. Vượt giới hạn sẽ gặp lỗi `EMAXCONNSESSION`.

## Xử lý sự cố

| Triệu chứng | Nguyên nhân và cách sửa |
|---|---|
| `ENOTFOUND` / `ENETUNREACH` tới `db.<ref>.supabase.co` | Đang dùng Direct connection (IPv6). Đổi sang Session pooler |
| `self-signed certificate` / `SSL required` | Thiếu `DB_SSL=true` hoặc thiếu hậu tố `?ssl_mode=disable` |
| `prepared statement … does not exist` | Đang dùng cổng 6543 (Transaction pooler). Đổi sang 5432 |
| `password authentication failed` | Sai mật khẩu, mật khẩu có ký tự đặc biệt chưa percent-encode, hoặc username thiếu `.<PROJECT_REF>` |
| `EMAXCONNSESSION max clients reached` | Hết 15 kết nối: có quá nhiều backend đang chạy (kể cả tiến trình cũ chưa tắt hẳn). Trên Windows, mở Task Manager tắt các tiến trình `node.exe` của backend cũ, hoặc giảm `DB_POOL_MAX` |
| `EADDRINUSE :::9000` | Còn một backend cũ đang chạy. Tắt nó rồi chạy lại |
| Upload ảnh lỗi `SignatureDoesNotMatch` | `S3_REGION` khác region của project, hoặc sai endpoint |
| Ảnh upload xong nhưng không hiện | Bucket chưa public hoặc `S3_FILE_URL` sai tên bucket |
| Storefront báo lỗi tải dữ liệu, API trả 400 | Thiếu hoặc sai `VITE_MEDUSA_PUBLISHABLE_KEY` (mỗi database có key riêng) |
| Sửa trong Admin của máy khác mà storefront chưa đổi | Do bộ nhớ đệm, chờ tối đa 5 phút hoặc khởi động lại backend |
| Không kết nối được sau vài ngày | Project Free bị tạm dừng sau 7 ngày không hoạt động. Vào dashboard bấm **Restore** |
