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

- `seed.ts`: store "Pawl" chỉ dùng VND; region "Việt Nam" thanh toán COD; giá **đã gồm VAT** (tax-inclusive, thuế suất mặc định 10%, đơn giản hoá cho demo); kho "Kho TP.HCM"; 2 phương thức giao hàng: tiêu chuẩn 30.000₫, nhanh 45.000₫. Cuối script in ra publishable key để chép vào `apps/storefront/.env`.
- `seed-catalog.ts`: cây danh mục Mèo/Chó, 36 sản phẩm (1–3 biến thể mỗi sản phẩm), collection "Bán chạy", tồn kho tại "Kho TP.HCM". Thuộc tính lọc lưu bằng tag dạng `prefix:value` (`species:`, `life:`, `health:`, `free:`, `form:`); `product.metadata` có `brand`, `ingredients`, `kcal_per_kg`, `feeding_guide`.
- Tên thương hiệu là thật, nhưng **mô tả, thành phần, kcal và hướng dẫn cho ăn do nhóm tự soạn cho demo**, không phải thông số chính thức của nhà sản xuất. Ảnh là placeholder (placehold.co); ảnh thật upload qua Admin.
- Giá trong Medusa v2 lưu theo đơn vị chính, VND không có phần lẻ: `145000` nghĩa là 145.000₫. ESLint rule `@medusajs/prices-in-major-units` cảnh báo nhầm với VND; đó chỉ là warning, không phải lỗi.

## Tài khoản demo

_(Bổ sung ở M1/M5.)_

## Thẻ test VNPay sandbox

_(Bổ sung ở M3.)_

## Tài liệu khác

- [docs/supabase-setup.md](docs/supabase-setup.md): tạo và cấu hình Supabase
- `docs/setup.md`, `docs/api.md`: bổ sung ở các milestone sau
