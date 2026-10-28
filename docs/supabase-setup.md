# Thiết lập Supabase cho Pawl

Pawl dùng Supabase cho **hai việc**: database PostgreSQL của Medusa và nơi lưu ảnh (Storage, qua giao thức S3).
Không dùng Supabase Auth, Data API hay anon key.

Có hai project (gói Free cho phép 2 project đang chạy mỗi organization):

| Project | Dùng khi |
|---|---|
| `pawl-dev` | Cả nhóm dùng chung khi phát triển |
| `pawl-demo` | Quay video, thuyết trình, chấm bài |

Làm các bước dưới đây cho từng project.

## 1. Tạo project

1. Vào https://supabase.com/dashboard → **New project**.
2. Tên: `pawl-dev` (hoặc `pawl-demo`).
3. **Region: Southeast Asia (Singapore)**. Đây là region gần Việt Nam nhất: mỗi lượt đi về tới database mất ~35 ms, so với ~105 ms nếu chọn Tokyo. Medusa chạy hàng chục truy vấn nối tiếp cho mỗi thao tác giỏ hàng, nên region quyết định trực tiếp tốc độ của web (xem [setup.md](setup.md#hiệu-năng)). Project `pawl-dev` hiện tại nằm ở Tokyo (`ap-northeast-1`).
4. **Database password**: nên chỉ gồm chữ và số (ví dụ do nút *Generate* tạo ra rồi bỏ ký tự đặc biệt).
   Nếu có ký tự đặc biệt (`@`, `#`, `/`, `:`…) thì phải percent-encode khi đặt vào URL (`@` → `%40`, `#` → `%23`…).
   Lưu mật khẩu lại, Supabase không hiển thị lại.
5. Chờ project khởi tạo xong (1–2 phút).

## 2. Lấy connection string (Session pooler)

1. Bấm nút **Connect** ở thanh trên cùng của project.
2. Chọn tab/kiểu **Session pooler**.
   - KHÔNG chọn *Direct connection*: chỉ chạy IPv6 trên gói Free, nhiều mạng ở Việt Nam không kết nối được.
   - KHÔNG chọn *Transaction pooler* (cổng 6543): không hỗ trợ prepared statement.
3. Chép chuỗi có dạng:
   ```
   postgresql://postgres.<PROJECT_REF>:[YOUR-PASSWORD]@aws-<N>-ap-southeast-1.pooler.supabase.com:5432/postgres
   ```
   Thay `[YOUR-PASSWORD]` bằng mật khẩu ở bước 1 (bỏ cả dấu `[]`). Chép host **đúng như dialog**, không tự sửa phần `aws-<N>`.
4. Thêm `?ssl_mode=disable` vào cuối (xem giải thích trong `docs/setup.md`), rồi đặt vào `DATABASE_URL` trong `apps/backend/.env`.

## 3. Tắt Data API

**Project Settings → Data API** (hoặc **Integrations → Data API**, tuỳ phiên bản dashboard) → tắt **Enable Data API** → Save.

Lý do: Medusa tạo bảng trong schema `public` bằng migration, không bật RLS. Nếu Data API bật, bảng có thể bị đọc/ghi qua REST bằng anon key. Pawl không dùng Data API nên tắt hẳn.

## 4. Tạo bucket ảnh

**Storage → New bucket**:
- Name: `pawl-media`
- **Public bucket: bật**
- Các giới hạn khác để mặc định (có thể đặt *Allowed MIME types* là `image/*`).

Bucket public nên **chỉ chứa ảnh công khai** (ảnh sản phẩm, sau này là ảnh pet).

## 5. Tạo S3 access key

**Storage → Settings** (mục **S3 Connection / S3 Configuration**):
1. Bật **Enable connection via S3 protocol** nếu đang tắt.
2. Chép **Endpoint** (dạng `https://<PROJECT_REF>.storage.supabase.co/storage/v1/s3`) và **Region** (dạng `ap-southeast-1`). Region phải **trùng với region của project**, tức là cùng phần `ap-...` trong host của Session pooler. Nếu sai region thì mọi thao tác với Storage (kể cả upload ảnh trong Admin) đều báo `SignatureDoesNotMatch`.
3. Mục **S3 Access Keys → New access key** → đặt mô tả `medusa-backend` → chép **Access key ID** và **Secret access key** (secret chỉ hiện một lần).

Key này có toàn quyền trên mọi bucket và bỏ qua RLS, nên **chỉ đặt trong `apps/backend/.env`**, không bao giờ đặt ở storefront hay commit lên git.

## 6. Điền `apps/backend/.env`

Chép `apps/backend/.env.example` thành `apps/backend/.env` rồi điền:

| Biến | Lấy ở đâu |
|---|---|
| `DATABASE_URL` | Bước 2 (có hậu tố `?ssl_mode=disable`) |
| `S3_FILE_URL` | `https://<PROJECT_REF>.supabase.co/storage/v1/object/public/pawl-media` |
| `S3_ENDPOINT` | Bước 5 |
| `S3_REGION` | Bước 5 |
| `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY` | Bước 5 |

`<PROJECT_REF>` là chuỗi ngẫu nhiên trong URL dashboard: `https://supabase.com/dashboard/project/<PROJECT_REF>`.

Kiểm tra kết nối:

```bash
cd apps/backend
node ./src/scripts/check-db.mjs
```

Script này không khởi động Medusa nên chạy được trước khi migrate. Kết nối ổn thì in ra phiên bản Postgres, `TLS: yes` và số bảng trong schema `public` (lần đầu là 0). Lỗi thì in mã lỗi kèm gợi ý cách sửa.

## Lưu ý gói Free

- 500 MB database và 1 GB storage mỗi project. Ảnh nên nén trước khi upload (WebP/JPEG, cạnh dài ≤ 1200px, dưới 300 KB).
- **Project tự tạm dừng sau 7 ngày không hoạt động.** Trước buổi demo hoặc chấm bài, vào dashboard kiểm tra project đang chạy; nếu bị dừng thì bấm **Restore**.
- Session pooler chỉ cho **tối đa 15 kết nối cho cả project**. Mỗi backend Pawl dùng tối đa 5 (`DB_POOL_MAX`), nên chỉ khoảng 2–3 người chạy backend cùng lúc trên một project.
- Giới hạn có thể thay đổi, xem trang pricing của Supabase.

## Làm việc nhóm trên `pawl-dev`

- Chỉ một người chạy `seed`.
- Ai pull code có migration mới thì chạy `npx medusa db:migrate`.
- Muốn thử nghiệm phá dữ liệu thì tạo project Supabase riêng trong organization cá nhân.
- Backend có bộ nhớ đệm: sản phẩm, giá do người khác sửa trên cùng database sẽ hiện ra trên máy mình sau tối đa 5 phút.

## Project `pawl-demo`

Làm lại các bước 1–6 với tên `pawl-demo` (region Singapore), rồi làm theo [setup.md, mục 7](setup.md#7-chuyển-sang-project-pawl-demo) để migrate, seed, tạo admin và upload ảnh thật. Trước buổi demo hoặc chấm bài, vào dashboard kiểm tra `pawl-demo` đang chạy (không bị tạm dừng) và Data API vẫn tắt.
