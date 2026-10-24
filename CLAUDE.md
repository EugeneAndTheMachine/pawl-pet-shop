# CLAUDE.md — Pawl (E-commerce B2C cho chó mèo)

> File này là "bản giao việc" cho Claude Code. Đọc hết trước khi viết dòng code đầu tiên.
> Ngôn ngữ giao diện: **tiếng Việt**. Ngôn ngữ code, tên biến, commit: **tiếng Anh**.
> Hạn nộp đồ án: **23:59 ngày 14/11/2026** (môn Electronic Commerce CO3027).
> Hạ tầng: **Medusa v2 (backend) + Supabase (PostgreSQL + Storage)**. **Không dùng Docker.**

---

## 0. Cách làm việc (đọc trước tiên)

1. **Làm theo milestone** ở mục 7, đúng thứ tự. Hết mỗi milestone thì **dừng lại**, báo cáo cho người dùng: đã làm gì, chạy lệnh gì để kiểm tra, còn gì chưa xong. Chỉ sang milestone tiếp khi người dùng đồng ý.
2. **Chỉ làm Phase 1** (mục 3). Các tính năng Phase 2 (mục 10) **không được code** lúc này, chỉ cần không chặn đường làm sau.
3. **Medusa v2 thay đổi API khá nhanh** (tài liệu đang ở v2.2x). Với mọi API của Medusa (SDK, workflow, module provider, cấu hình), **đọc tài liệu chính thức** tại https://docs.medusajs.com trước khi code, đừng chỉ dựa vào trí nhớ. Supabase cũng vậy: https://supabase.com/docs. Nếu tài liệu khác với file này thì **làm theo tài liệu** và ghi chú lại cho người dùng.
4. Code xong phần nào thì kiểm tra phần đó ngay: chạy typecheck, build, chạy thử luồng trên trình duyệt hoặc bằng `curl`. Không báo "xong" khi chưa chạy thử.
5. Chưa hỏi người dùng thì **không** tự thêm thư viện lớn ngoài danh sách ở mục 2 (UI kit, state manager, ORM khác…).
6. **Không bao giờ commit secret.** Mọi khoá đặt trong `.env`, chỉ commit `.env.example`.
7. **Bạn không tự tạo được project Supabase.** Những bước cần thao tác trên dashboard Supabase (mục 5.1) thì hướng dẫn người dùng làm từng bước rồi chờ họ gửi lại giá trị cần thiết. Không đoán connection string.
8. Gặp quyết định kiến trúc chưa có trong file này thì hỏi người dùng, kèm 2 phương án và khuyến nghị của bạn.
9. Ưu tiên thay đổi nhỏ, dễ đọc. Không refactor phần không liên quan.

---

## 1. Tóm tắt sản phẩm

**Pawl** là website B2C bán đồ cho thú cưng (chó và mèo, ưu tiên mèo): thức ăn hạt, pate, cát vệ sinh, snack, dinh dưỡng bổ sung, phụ kiện.

- Khách hàng mục tiêu: người 22–40 tuổi ở TP.HCM và Hà Nội, đi làm bận rộn, quen mua và thanh toán online.
- Điểm khác biệt (làm ở Phase 2): **hồ sơ thú cưng → gợi ý sản phẩm phù hợp** và **đặt hàng định kỳ** 2/4/6 tuần (subscription).
- Phase 1 là một cửa hàng online hoàn chỉnh, chạy ổn định, đủ các yêu cầu bắt buộc của đồ án:
  quản lý sản phẩm, giỏ hàng, thanh toán (thật hoặc giả lập), quản lý đơn hàng, tuỳ chọn giao hàng, bảo mật.

### Actor

| Actor | Mô tả | Phase 1 |
|---|---|---|
| Guest | Chưa đăng nhập | Xem, tìm, lọc sản phẩm; giỏ hàng; checkout bằng email + SĐT |
| Customer | Đã đăng nhập | Như Guest + tài khoản, sổ địa chỉ, lịch sử đơn |
| Admin | Nhân viên cửa hàng | **Dùng Medusa Admin có sẵn** (`/app`). Không tự code trang admin ở Phase 1 |

Guest và Customer dùng **chung một storefront**, chỉ khác trạng thái đăng nhập.

---

## 2. Tech stack (đã chốt)

| Phần | Công nghệ |
|---|---|
| Backend | **Medusa v2** (Node.js, TypeScript), cổng `9000`, Admin tại `/app` |
| Database | **Supabase PostgreSQL**, kết nối qua **Session pooler** (Supavisor session mode, cổng 5432, hỗ trợ IPv4 và prepared statement) |
| Lưu ảnh | **Supabase Storage** qua provider `@medusajs/medusa/file-s3` (Supabase tương thích S3). Dùng ngay từ khi dev để mọi máy cùng thấy ảnh |
| Redis | **Không dùng ở Phase 1.** Medusa tự dùng bản in-memory khi không có `REDIS_URL`. Lúc deploy nếu cần thì thêm Upstash |
| Auth khách hàng | **Auth của Medusa** (emailpass). **Không dùng Supabase Auth** |
| Storefront | **Vite + React 18/19 + TypeScript**, cổng `5173` |
| Gọi API | `@medusajs/js-sdk`. Storefront **không** dùng `@supabase/supabase-js` |
| Routing | `react-router` (v7, dùng như thư viện, không dùng framework mode) |
| Data fetching | `@tanstack/react-query` v5 |
| Form | `react-hook-form` + `zod` + `@hookform/resolvers` |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`) |
| Thanh toán | **COD** (provider có sẵn `pp_system_default`) + **VNPay sandbox** (provider tự viết) |
| Giao hàng | Phase 1: 2 phương thức giá cố định dùng provider manual có sẵn. GHN để Phase 2 |
| Email | Notification provider `local` (in ra console) |
| Node | **Node 20 LTS trở lên** |

**Vai trò của Supabase:** chỉ là nơi chứa database Postgres và file ảnh của Medusa. Toàn bộ logic (sản phẩm, giỏ, đơn, đăng nhập) vẫn đi qua API của Medusa. Không gọi Supabase trực tiếp từ storefront, không viết bảng hay RLS policy bằng tay trên dashboard. Bảng được tạo bằng migration của Medusa.

---

## 3. Phạm vi Phase 1 (làm bây giờ)

### Có trong Phase 1
- Danh mục sản phẩm, tìm kiếm, lọc theo tag/danh mục, sắp xếp, phân trang
- Trang chi tiết sản phẩm có biến thể (ví dụ 400g / 1.5kg), giá VND, tình trạng còn hàng
- Giỏ hàng (lưu `cart_id` trong localStorage), sửa số lượng, xoá, mã giảm giá
- Checkout 1 trang gồm 5 bước: liên hệ → địa chỉ → giao hàng → thanh toán → xác nhận
- Thanh toán **COD** và **VNPay sandbox** (redirect + return URL + IPN)
- Trang kết quả thanh toán và trang xác nhận đơn
- Đăng ký / đăng nhập / đăng xuất / quên mật khẩu (email in ra console)
- Tài khoản: tổng quan, thông tin cá nhân, sổ địa chỉ, danh sách và chi tiết đơn
- Trang chính sách tĩnh (điều khoản, bảo mật dữ liệu, đổi trả, vận chuyển, thanh toán), giới thiệu, liên hệ, 404
- Footer có thông tin pháp lý (tên doanh nghiệp, địa chỉ, MST, liên hệ). Dùng dữ liệu giả, ghi rõ là demo
- Medusa Admin: sản phẩm, ảnh (upload lên Supabase Storage), biến thể, giá, tồn kho, đơn hàng, khách hàng, khuyến mãi
- Responsive (mobile-first)

### KHÔNG có trong Phase 1
Hồ sơ pet, gợi ý sản phẩm, subscription, chatbot Gemini, tích hợp GHN thật, trang analytics, admin widget, quiz, tra cứu đơn cho Guest, đăng nhập Google, đánh giá sản phẩm, wishlist, Redis.

---

## 4. Cấu trúc thư mục

Hai app độc lập trong một repo. **Không dùng workspace** ở Phase 1 để tránh xung đột dependency của Medusa. Mỗi app có `package.json` và lockfile riêng, dùng **npm**.

```
pawl/
├── CLAUDE.md
├── README.md                      # hướng dẫn cài đặt + chạy (nộp đồ án Part 4.2)
├── .gitignore
├── docs/
│   ├── supabase-setup.md          # các bước tạo project Supabase có ảnh chụp/ghi chú
│   ├── api.md                     # route custom + luồng checkout
│   └── setup.md                   # hướng dẫn chi tiết từng bước
├── apps/
│   ├── backend/                   # tạo bằng create-medusa-app (KHÔNG kèm Next.js storefront)
│   │   ├── medusa-config.ts
│   │   ├── .env.example
│   │   ├── integration-tests/
│   │   └── src/
│   │       ├── admin/             # (Phase 2) widgets, routes
│   │       ├── api/
│   │       │   ├── middlewares.ts
│   │       │   ├── store/
│   │       │   │   └── vnpay/
│   │       │   │       └── verify/route.ts      # GET: kiểm tra chữ ký return URL
│   │       │   └── hooks/
│   │       │       └── vnpay/
│   │       │           └── ipn/route.ts         # GET: IPN của VNPay
│   │       ├── modules/
│   │       │   └── vnpay/                       # Payment Module Provider
│   │       │       ├── index.ts
│   │       │       ├── service.ts
│   │       │       └── lib/
│   │       │           ├── sign.ts              # sort params, encode, HMAC-SHA512
│   │       │           ├── build-url.ts
│   │       │           └── __tests__/sign.spec.ts
│   │       ├── workflows/
│   │       ├── subscribers/
│   │       │   └── order-placed.ts              # log/email xác nhận đơn
│   │       ├── jobs/                            # (Phase 2)
│   │       ├── links/                           # (Phase 2)
│   │       └── scripts/
│   │           ├── check-db.ts                  # kiểm tra kết nối Supabase
│   │           ├── seed.ts                      # region VN, kho, shipping, publishable key
│   │           └── seed-catalog.ts              # danh mục + sản phẩm mẫu
│   └── storefront/
│       ├── index.html
│       ├── vite.config.ts
│       ├── .env.example
│       ├── public/
│       └── src/
│           ├── main.tsx
│           ├── app/
│           │   ├── router.tsx
│           │   ├── providers.tsx          # QueryClient, AuthProvider, CartProvider
│           │   └── guards.tsx             # RequireAuth cho /account/*
│           ├── pages/                     # 1 file = 1 route, chỉ ghép component
│           │   ├── home.tsx
│           │   ├── products.tsx           # /products, /c/:handle, /search
│           │   ├── product-detail.tsx
│           │   ├── cart.tsx
│           │   ├── checkout.tsx
│           │   ├── checkout-result.tsx
│           │   ├── order-confirmed.tsx
│           │   ├── auth/{login,register,forgot-password,reset-password}.tsx
│           │   ├── account/{overview,profile,addresses}.tsx
│           │   ├── account/orders/{list,detail}.tsx
│           │   ├── policy.tsx
│           │   ├── about.tsx
│           │   ├── contact.tsx
│           │   └── not-found.tsx
│           ├── features/
│           │   ├── catalog/{api.ts,hooks.ts,tag-labels.ts,components/}
│           │   ├── cart/{api.ts,hooks.ts,cart-context.tsx,components/}
│           │   ├── checkout/{api.ts,hooks.ts,schemas.ts,steps/}
│           │   ├── auth/{api.ts,auth-context.tsx,schemas.ts}
│           │   ├── account/{api.ts,hooks.ts,components/}
│           │   └── orders/{api.ts,hooks.ts,components/}
│           ├── components/
│           │   ├── ui/                    # Button, Input, Select, Badge, Dialog, Skeleton, Toast
│           │   └── layout/                # Header, Footer, MiniCartDrawer, AccountLayout, Breadcrumb
│           ├── lib/
│           │   ├── medusa.ts              # khởi tạo SDK
│           │   ├── query-client.ts
│           │   ├── format.ts              # formatVND, formatDate
│           │   ├── storage.ts             # localStorage bọc try/catch
│           │   └── vn-provinces.ts        # danh sách 34 tỉnh/thành
│           ├── content/policies/*.md
│           └── styles/globals.css
```

---

## 5. Thiết lập môi trường (Milestone 0)

### 5.1 Supabase (người dùng làm trên dashboard, Claude Code hướng dẫn)

Mô hình project (gói Free cho phép 2 project đang chạy mỗi organization):
- **`pawl-dev`**: cả nhóm dùng chung khi phát triển.
- **`pawl-demo`**: dùng khi deploy, quay video và thuyết trình. Tạo ở M5.

Các bước cho mỗi project:
1. Tạo project mới, **region Singapore** (gần Việt Nam nhất). Lưu lại **database password**. Mật khẩu chỉ nên gồm chữ và số, nếu có ký tự đặc biệt thì phải percent-encode trong URL.
2. **Lấy connection string:** nút **Connect** → chọn **Session pooler** (KHÔNG chọn Direct connection vì chỉ chạy IPv6 trên gói Free, nhiều mạng ở Việt Nam không kết nối được; KHÔNG chọn Transaction pooler vì không hỗ trợ prepared statement). Dạng:
   `postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-<N>-ap-southeast-1.pooler.supabase.com:5432/postgres`
   Host phải chép đúng từ dialog, không tự đoán phần `aws-<N>`.
3. **Tắt Data API:** vào phần Data API của project và tắt **Enable Data API**.
   *Lý do:* Medusa tạo bảng trong schema `public` bằng migration (không bật RLS). Nếu Data API bật, bảng trong `public` có thể bị đọc/ghi qua REST bằng anon key. Pawl không dùng Data API nên tắt hẳn là an toàn nhất.
4. **Storage:** tạo bucket **public** tên `pawl-media` (chứa ảnh sản phẩm, sau này có ảnh pet).
5. **S3 access key:** Storage → Settings / S3 configuration → bật S3 connection nếu cần → tạo **Access key ID** và **Secret access key**. Chép thêm **Endpoint** và **Region** hiển thị ở đó.
   Key này có toàn quyền trên mọi bucket và bỏ qua RLS, nên **chỉ đặt ở backend**.
6. Gửi cho Claude Code (qua `.env`, không dán vào chat nếu làm việc chung): `DATABASE_URL`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `PROJECT_REF`.

**Lưu ý gói Free:** 500 MB database và 1 GB storage mỗi project; **project tự tạm dừng sau 7 ngày không có hoạt động**. Trước buổi demo hoặc chấm bài, vào dashboard kiểm tra project `pawl-demo` đang chạy. Kiểm tra lại giới hạn hiện hành ở trang pricing của Supabase.

**Làm việc nhóm trên `pawl-dev`:** chỉ một người chạy `seed`. Ai pull code có migration mới thì chạy `npx medusa db:migrate`. Muốn thử nghiệm phá dữ liệu thì tạo project Supabase riêng ở organization cá nhân.

### 5.2 Backend

- Tạo bằng `npx create-medusa-app@latest` vào `apps/backend`, dùng flag **`--skip-db`** (tự cấu hình DB Supabase sau), **không** cài Next.js starter storefront. Xem flag hiện hành bằng `--help` hoặc trong tài liệu.
- `apps/backend/.env.example`:
  ```
  # Supabase Postgres — Session pooler (cổng 5432)
  DATABASE_URL=postgresql://postgres.<PROJECT_REF>:<PASSWORD>@aws-<N>-ap-southeast-1.pooler.supabase.com:5432/postgres
  DB_SSL=true

  # Supabase Storage (S3)
  S3_FILE_URL=https://<PROJECT_REF>.supabase.co/storage/v1/object/public/pawl-media
  S3_ENDPOINT=https://<PROJECT_REF>.storage.supabase.co/storage/v1/s3
  S3_REGION=ap-southeast-1
  S3_BUCKET=pawl-media
  S3_ACCESS_KEY_ID=
  S3_SECRET_ACCESS_KEY=

  # Medusa
  STORE_CORS=http://localhost:5173
  ADMIN_CORS=http://localhost:9000,http://localhost:5173
  AUTH_CORS=http://localhost:9000,http://localhost:5173
  JWT_SECRET=change-me
  COOKIE_SECRET=change-me
  STOREFRONT_URL=http://localhost:5173
  BACKEND_URL=http://localhost:9000
  # REDIS_URL=   (để trống ở Phase 1)

  # VNPay sandbox
  VNP_TMN_CODE=
  VNP_HASH_SECRET=
  VNP_PAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
  VNP_API_URL=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
  VNP_RETURN_URL=http://localhost:5173/checkout/result
  ```
  Endpoint và region lấy **đúng như dashboard hiển thị**. Endpoint dạng `*.supabase.co/storage/v1/s3` cũng dùng được.

- `medusa-config.ts`, phần cần chỉnh:
  - **SSL tới Supabase:** Supabase yêu cầu SSL ngay cả khi dev, nên cấu hình theo `DB_SSL` thay vì theo `NODE_ENV`:
    ```ts
    databaseDriverOptions: process.env.DB_SSL === "true"
      ? { connection: { ssl: { rejectUnauthorized: false } } }
      : {},
    ```
    Tài liệu Medusa (mục `databaseDriverOptions`) có ghi: khi đặt `rejectUnauthorized: false` thì thêm `?ssl_mode=disable` vào cuối `databaseUrl` để tham số trong URL không đè lên cấu hình SSL của driver; kết nối vẫn được mã hoá qua `ssl` ở trên. **Đọc lại mục này trong tài liệu**, rồi thử cả hai cách (có và không có hậu tố) bằng `check-db.ts`, giữ cách chạy được và ghi lại cho người dùng.
  - **File provider:** File Module chỉ nhận **một** provider. Dùng S3 khi có `S3_ACCESS_KEY_ID`, ngược lại dùng `file-local`:
    ```ts
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          process.env.S3_ACCESS_KEY_ID
            ? {
                resolve: "@medusajs/medusa/file-s3",
                id: "s3",
                options: {
                  file_url: process.env.S3_FILE_URL,
                  access_key_id: process.env.S3_ACCESS_KEY_ID,
                  secret_access_key: process.env.S3_SECRET_ACCESS_KEY,
                  region: process.env.S3_REGION,
                  bucket: process.env.S3_BUCKET,
                  endpoint: process.env.S3_ENDPOINT,
                  additional_client_config: { forcePathStyle: true }, // bắt buộc với Supabase
                },
              }
            : { resolve: "@medusajs/medusa/file-local", id: "local" },
        ],
      },
    }
    ```
  - Không khai báo `redisUrl` khi `REDIS_URL` trống.
- `src/scripts/check-db.ts`: chạy `select version(), current_database(), now()` qua kết nối của Medusa và in kết quả. Chạy bằng `npx medusa exec ./src/scripts/check-db.ts`. Đây là bước đầu tiên của M0 để biết kết nối Supabase đã ổn.
- Lệnh thường dùng (kiểm tra lại tên lệnh trong tài liệu):
  - `npx medusa db:migrate` (lần đầu chạy trên Supabase mất vài phút vì qua mạng)
  - `npx medusa exec ./src/scripts/seed.ts`
  - `npx medusa user -e admin@pawl.local -p <password>`
  - `npm run dev`: server ở http://localhost:9000, admin ở http://localhost:9000/app

**Lỗi hay gặp:**

| Triệu chứng | Nguyên nhân thường gặp |
|---|---|
| `ENOTFOUND` / `ENETUNREACH` tới `db.<ref>.supabase.co` | Đang dùng Direct connection (IPv6). Đổi sang Session pooler |
| `self-signed certificate` / `SSL required` | Thiếu `databaseDriverOptions.ssl` hoặc sai hậu tố URL |
| `prepared statement … does not exist` | Đang dùng cổng 6543 (Transaction pooler). Đổi sang 5432 Session pooler |
| `password authentication failed` | Sai mật khẩu, mật khẩu có ký tự đặc biệt chưa encode, hoặc username thiếu `.<PROJECT_REF>` |
| Upload ảnh lỗi `SignatureDoesNotMatch` / `NoSuchBucket` | Sai endpoint/region, thiếu `forcePathStyle: true`, hoặc chưa tạo bucket |
| Ảnh upload xong nhưng không xem được | Bucket chưa đặt là public, hoặc `S3_FILE_URL` sai tên bucket |
| Không kết nối được sau vài ngày | Project Free bị tạm dừng, vào dashboard bấm Restore |

### 5.3 Storefront

- `npm create vite@latest storefront -- --template react-ts` trong thư mục `apps/`
- `apps/storefront/.env.example`:
  ```
  VITE_MEDUSA_URL=http://localhost:9000
  VITE_MEDUSA_PUBLISHABLE_KEY=pk_...
  ```
- **Chỉ đặt giá trị công khai trong biến `VITE_*`.** Mọi biến `VITE_*` đều bị lộ ra trình duyệt. Không đặt key Supabase nào ở đây.
- `src/lib/medusa.ts`: tạo `new Medusa({ baseUrl, publishableKey, auth: { type: "session" } })`. Bật `debug` khi dev.
  Khi dev, cả hai app đều ở localhost nên session cookie chạy bình thường. Đến lúc deploy lên 2 domain khác nhau thì xem lại cấu hình cookie (`sameSite=none`, `secure`) hoặc chuyển sang `jwt`. Hỏi người dùng trước khi đổi.
- Ảnh sản phẩm hiển thị trực tiếp từ URL public của Supabase Storage. Thêm hostname đó vào `img-src` nếu sau này có CSP.

### 5.4 README

`README.md` có: yêu cầu (Node 20+, tài khoản Supabase), link tới `docs/supabase-setup.md`, các bước chạy từ đầu (tạo `.env` → `check-db` → migrate → seed → tạo admin → chạy 2 app), tài khoản demo, thẻ test VNPay (mục 8.4), lưu ý project Free bị tạm dừng sau 7 ngày.

**Hoàn thành M0 khi:** `check-db.ts` in ra phiên bản Postgres của Supabase; `db:migrate` chạy xong và thấy bảng của Medusa trong Table Editor của Supabase; backend mở được `/app` và đăng nhập admin được; **upload một ảnh sản phẩm trong Admin thì file xuất hiện trong bucket `pawl-media` và xem được ảnh qua URL public**; storefront hiển thị trang có header; `npm run build` của cả 2 app không lỗi; Data API đã tắt.

---

## 6. Dữ liệu mẫu và quy ước (Milestone 1)

### 6.1 `seed.ts`
- **Region** "Việt Nam": currency `vnd`, country `vn`. Giá **đã gồm VAT**: cấu hình price preference dạng tax-inclusive cho region/currency (xem tài liệu "tax-inclusive pricing").
- **Sales channel** mặc định + **publishable API key** gắn với sales channel. In key ra console để chép vào `.env` của storefront.
- **Stock location** "Kho TP.HCM", nối với provider fulfillment manual và sales channel.
- **Shipping profile** mặc định + 2 **shipping option** giá cố định:
  - "Giao tiêu chuẩn (2–4 ngày)": 30.000₫
  - "Giao nhanh (trong ngày, nội thành)": 45.000₫
- **Payment providers** cho region: `pp_system_default` (COD). Ở M3, sau khi có provider VNPay thì thêm `pp_vnpay_vnpay`.
- Giá trong Medusa v2 là **đơn vị chính** (VND không có phần lẻ). Không nhân 100 khi lưu giá.
- Seed phải **idempotent**: kiểm tra đã tồn tại trước khi tạo, vì cả nhóm dùng chung database `pawl-dev`.

### 6.2 `seed-catalog.ts`
- Cây danh mục:
  - Mèo → Thức ăn hạt, Pate & thức ăn ướt, Cát vệ sinh, Snack, Dinh dưỡng bổ sung, Phụ kiện
  - Chó → Thức ăn hạt, Pate & thức ăn ướt, Snack, Dinh dưỡng bổ sung, Phụ kiện
- **20–40 sản phẩm**, mỗi sản phẩm có 1–3 biến thể theo khối lượng hoặc quy cách. Mỗi biến thể có giá VND, SKU, tồn kho tại "Kho TP.HCM".
- Thương hiệu: có thể dùng tên thương hiệu thật phổ biến tại VN cho thực tế. Mô tả sản phẩm tự viết, không sao chép.
- Ảnh: seed dùng URL placeholder. Storefront phải có ảnh fallback khi sản phẩm không có ảnh. Ảnh thật thì người dùng upload qua Admin, ảnh sẽ vào Supabase Storage.
- Gói Free chỉ có 1 GB storage: ảnh upload nên nén trước (WebP/JPEG, cạnh dài ≤ 1200px, dưới 300 KB). Ghi lưu ý này vào README.

### 6.3 Quy ước tag (BẮT BUỘC, Phase 2 dựa vào đây)
Thuộc tính để lọc lưu bằng **product tag** theo dạng `prefix:value`, viết thường, không dấu:

| Prefix | Giá trị |
|---|---|
| `species:` | `cat`, `dog` |
| `life:` | `kitten`, `puppy`, `adult`, `senior`, `all` |
| `health:` | `urinary`, `hairball`, `sensitive-stomach`, `weight-control`, `skin-coat`, `dental`, `sterilised` |
| `free:` | `chicken`, `beef`, `fish`, `grain` (nghĩa là "không chứa …") |
| `form:` | `dry`, `wet`, `litter`, `treat`, `supplement`, `accessory` |

Storefront hiển thị nhãn tiếng Việt cho từng tag (map trong `features/catalog/tag-labels.ts`).
Thêm vào `product.metadata` (để sẵn cho Phase 2, Phase 1 chỉ hiển thị nếu có): `brand`, `ingredients` (chuỗi), `kcal_per_kg` (số), `feeding_guide` (chuỗi).

**Hoàn thành M1 khi:** seed chạy lại nhiều lần không lỗi và không nhân đôi dữ liệu; Admin thấy đủ danh mục, sản phẩm, tồn kho; `GET /store/products` (kèm header publishable key) trả về sản phẩm có `calculated_price` theo VND.

---

## 7. Milestones Phase 1

Mỗi milestone kết thúc bằng: typecheck + build xanh, chạy thử thủ công theo checklist, báo cáo cho người dùng, rồi commit.

### M0. Thiết lập (mục 5)
### M1. Dữ liệu mẫu (mục 6)

### M2. Storefront: duyệt sản phẩm
- [ ] Layout: Header (logo "Pawl", ô tìm kiếm, nút chuyển Mèo/Chó, icon giỏ có số lượng, menu tài khoản), Footer (danh mục, chính sách, thông tin pháp lý), MiniCartDrawer.
- [ ] **Trang chủ `/`**: hero + CTA "Mua ngay"; lưới danh mục nổi bật; "Sản phẩm mới"; "Bán chạy" (Phase 1 có thể dùng collection "Bán chạy" chọn tay trong Admin); khối giới thiệu "Đặt định kỳ (sắp ra mắt)" chỉ là nội dung tĩnh.
- [ ] **Danh sách `/products`, `/c/:categoryHandle`, `/search?q=`**:
  - Lọc: loài, giai đoạn tuổi, nhu cầu sức khoẻ, "không chứa", dạng sản phẩm (đều lọc qua `tag_id`); khoảng giá (lọc phía client trên trang hiện tại là được, ghi chú giới hạn)
  - Sắp xếp: mới nhất, giá tăng/giảm (nếu Store API chưa hỗ trợ sort theo giá thì sort client-side và ghi chú lại)
  - Phân trang `limit/offset`; trạng thái loading (skeleton), rỗng, lỗi
  - Trạng thái bộ lọc nằm trên URL query để chia sẻ được link
- [ ] **Chi tiết `/products/:handle`**: gallery, tên, thương hiệu, giá, chọn biến thể, số lượng, còn/hết hàng, nút "Thêm vào giỏ"; tab Mô tả / Thành phần / Hướng dẫn cho ăn (lấy từ metadata nếu có); sản phẩm cùng danh mục.
- [ ] Giá hiển thị dạng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- [ ] Database ở xa (Singapore) nên mỗi request chậm hơn chạy local. Dùng `staleTime` hợp lý của React Query và skeleton để giao diện không bị giật.

API chính: `sdk.store.category.list`, `sdk.store.product.list({ region_id, q, category_id, tag_id, limit, offset, fields })`. `fields` phải có `*variants.calculated_price` để lấy giá theo region. Region lấy một lần qua `sdk.store.region.list` rồi cache lại.

**Hoàn thành khi:** từ trang chủ vào được danh mục, lọc được, mở được trang chi tiết, đổi biến thể thì giá và tồn kho đổi theo; ảnh từ Supabase Storage hiển thị đúng; giao diện chạy được ở độ rộng 375px.

### M3. Giỏ hàng, checkout, thanh toán
- [ ] **CartProvider**: tạo cart theo region VN khi thêm sản phẩm đầu tiên, lưu `cart_id` vào localStorage; nếu cart đã `completed` hoặc không tìm thấy thì tạo cart mới.
- [ ] **Giỏ `/cart`** + mini-cart: đổi số lượng, xoá, áp/gỡ mã giảm giá (theo API promotions trong tài liệu), tạm tính, giảm giá, tổng.
- [ ] **Checkout `/checkout`** (accordion 5 bước, validate từng bước bằng zod):
  1. Liên hệ: email (bắt buộc), SĐT (regex SĐT VN). Customer đã đăng nhập thì tự điền.
  2. Địa chỉ: họ tên, SĐT, tỉnh/thành (select từ `vn-provinces.ts`, 34 đơn vị sau sáp nhập 2025), phường/xã (text), địa chỉ chi tiết. Map vào trường của Medusa: `province` = tỉnh/thành, `city` = phường/xã, `address_1` = số nhà và đường, `country_code` = `vn`. Customer chọn được địa chỉ có sẵn trong sổ.
  3. Giao hàng: `sdk.store.fulfillment.listCartOptions({ cart_id })` → chọn → `sdk.store.cart.addShippingMethod`.
  4. Thanh toán: chọn COD hoặc VNPay → `sdk.store.payment.initiatePaymentSession(cart, { provider_id, data: { cart_id } })`.
  5. Xác nhận: tóm tắt đơn, tick "Tôi đồng ý với Điều khoản và Chính sách bảo mật" (bắt buộc), nút Đặt hàng.
     - COD: `sdk.store.cart.complete(cart.id)` → nếu `type === "order"` thì xoá `cart_id` và chuyển tới `/orders/:id/confirmed`.
     - VNPay: chuyển trình duyệt tới `payment_url` lấy từ `data` của payment session.
- [ ] **Payment provider VNPay** (`src/modules/vnpay`). Xem mục 8.
- [ ] **`/checkout/result`**: đọc query VNPay → gọi `GET /store/vnpay/verify?...` → nếu hợp lệ và thành công thì `cart.complete` → `/orders/:id/confirmed`; nếu thất bại hoặc khách huỷ thì báo lỗi, giữ nguyên giỏ, có nút "Thử lại" hoặc "Chọn COD".
- [ ] **`/orders/:id/confirmed`**: mã đơn (`display_id`), sản phẩm, địa chỉ, phương thức giao, phương thức thanh toán, tổng tiền. Guest thấy gợi ý "Tạo tài khoản bằng email này".
- [ ] Subscriber `order.placed`: log (hoặc gửi qua Notification provider `local`) nội dung email xác nhận.

**Hoàn thành khi:** Guest đặt được 1 đơn COD; Guest đặt được 1 đơn VNPay sandbox bằng thẻ test; cả hai đơn hiện trong Admin với đúng trạng thái thanh toán; thanh toán VNPay thất bại thì không tạo đơn và giỏ vẫn còn.

### M4. Tài khoản
- [ ] `/register`: email, mật khẩu (≥ 8 ký tự), họ tên, SĐT, checkbox đồng ý xử lý dữ liệu cá nhân. Luồng: `sdk.auth.register("customer", "emailpass", …)` → `sdk.store.customer.create(…)` → đăng nhập. Kiểm tra lại thứ tự gọi theo tài liệu "Customer registration" của Medusa.
- [ ] `/login` (`sdk.auth.login`), đăng xuất (`sdk.auth.logout`), hỗ trợ `?redirect=`.
- [ ] Quên và đặt lại mật khẩu theo luồng reset password của Medusa auth (`/auth/customer/emailpass/reset-password` → event → subscriber in link ra console → trang `/reset-password?token=&email=`).
- [ ] Sau khi đăng nhập: gắn cart hiện tại vào customer (`sdk.store.cart.transferCart` hoặc API tương đương trong tài liệu).
- [ ] `/account` (cần đăng nhập, có guard): sidebar gồm Tổng quan, Đơn hàng, Thông tin, Địa chỉ, Đăng xuất.
  - Tổng quan: lời chào, 3 đơn gần nhất.
  - Thông tin: sửa tên, SĐT (`sdk.store.customer.update`).
  - Địa chỉ: CRUD, chọn địa chỉ mặc định.
  - Đơn hàng: danh sách (mã, ngày, tổng, trạng thái thanh toán, trạng thái giao) và chi tiết (timeline trạng thái, sản phẩm, địa chỉ, nút "Mua lại" thêm lại toàn bộ sản phẩm vào giỏ).
- [ ] Checkout tự điền thông tin và địa chỉ cho Customer.

**Hoàn thành khi:** đăng ký → đăng nhập → đặt đơn → thấy đơn trong `/account/orders`; F5 vẫn giữ đăng nhập; vào `/account` khi chưa đăng nhập thì bị chuyển sang `/login?redirect=/account`.

### M5. Hoàn thiện Phase 1 + chuẩn bị demo
- [ ] Trang chính sách `/policies/:slug` render từ `src/content/policies/*.md` (cần thêm một thư viện markdown nhẹ, ví dụ `react-markdown`; hỏi người dùng trước). Gồm các slug `terms`, `privacy`, `returns`, `shipping`, `payment`.
- [ ] `/about`, `/contact` (form liên hệ chỉ cần hiện toast, chưa gửi đi), 404.
- [ ] Footer pháp lý: tên công ty demo, địa chỉ, MST demo, email/hotline. Ghi rõ "Dự án học tập – không kinh doanh thật".
- [ ] Kiểm tra bảo mật theo mục 9.
- [ ] SEO cơ bản: `<title>` và meta description cho từng trang (dùng thẻ `<title>` trong component của React 19, hoặc `react-helmet-async` nếu dùng React 18).
- [ ] Rà responsive (375px, 768px, 1280px) và accessibility cơ bản (label cho input, focus ring, alt cho ảnh, tương phản màu).
- [ ] Tạo project Supabase **`pawl-demo`** theo mục 5.1, migrate + seed, upload ảnh thật cho sản phẩm hiển thị trên trang chủ.
- [ ] `README.md` + `docs/supabase-setup.md` + `docs/setup.md` + `docs/api.md` đầy đủ.
- [ ] Test: unit test cho `vnpay/lib/sign.ts`; integration test cho route `vnpay/verify` (chữ ký đúng/sai).

**Hoàn thành khi:** một người mới clone repo, có tài khoản Supabase, làm theo README chạy được toàn bộ trong khoảng 20 phút.

---

## 8. VNPay sandbox: đặc tả provider

### 8.1 Đăng ký
Người dùng tự đăng ký merchant sandbox tại trang đăng ký sandbox của VNPay để lấy `vnp_TmnCode` và `vnp_HashSecret`. Nếu `.env` chưa có hai giá trị này thì provider phải **báo lỗi rõ ràng** khi khởi tạo thanh toán, không được im lặng.

### 8.2 Provider (`AbstractPaymentProvider`)
- Đăng ký trong `medusa-config.ts` dưới module `@medusajs/medusa/payment`, `providers: [{ resolve: "./src/modules/vnpay", id: "vnpay", options: {...} }]`. Provider id sẽ là `pp_vnpay_vnpay`. Đọc guide "Create Payment Module Provider" để lấy đúng chữ ký các method.
- `initiatePayment`:
  - Tạo `txnRef` **chỉ gồm chữ và số**, duy nhất (ví dụ timestamp + chuỗi ngẫu nhiên).
  - Tham số gửi đi: `vnp_Version=2.1.0`, `vnp_Command=pay`, `vnp_TmnCode`, `vnp_Amount = amount * 100` (số nguyên), `vnp_CurrCode=VND`, `vnp_TxnRef`, `vnp_OrderInfo` (không dấu, ví dụ `Thanh toan don hang Pawl <txnRef>`), `vnp_OrderType=other`, `vnp_Locale=vn`, `vnp_ReturnUrl`, `vnp_IpAddr`, `vnp_CreateDate` và `vnp_ExpireDate` (định dạng `yyyyMMddHHmmss`, **giờ Asia/Ho_Chi_Minh**, hết hạn sau 15 phút).
  - Ký: sắp xếp key theo alphabet → encode giá trị (dấu cách thành `+`, giống `querystring` của VNPay) → nối `key=value&…` → HMAC-SHA512 bằng `HashSecret` → thêm `vnp_SecureHash`.
  - Trả về `data`: `{ txn_ref, create_date, payment_url, amount, cart_id }`.
- `authorizePayment`: xác nhận giao dịch **ở phía server** rồi mới trả `authorized`.
  - **Cách A (ưu tiên):** gọi API `querydr` của VNPay (`VNP_API_URL`) với `txn_ref` và `create_date`; giao dịch có `vnp_ResponseCode == "00"` và `vnp_TransactionStatus == "00"` thì `authorized`, ngược lại `error` hoặc `pending`.
  - **Cách B (dự phòng, nếu querydr của sandbox không dùng được):** route verify/IPN, sau khi kiểm tra chữ ký hợp lệ, ghi kết quả vào `data` của payment session qua Payment Module service; `authorizePayment` đọc cờ đó. Báo người dùng biết đang dùng cách nào.
- `capturePayment`: coi như đã capture khi authorized (VNPay thu tiền ngay).
- `refundPayment`: Phase 1 chỉ ghi log và trả về thành công (hoàn tiền giả lập). Ghi rõ trong code.
- `cancelPayment`, `deletePayment`, `updatePayment`, `retrievePayment`, `getPaymentStatus`: cài đặt tối thiểu, đúng kiểu dữ liệu.

### 8.3 Route
- `GET /store/vnpay/verify`: nhận toàn bộ query từ return URL → kiểm tra chữ ký → trả `{ valid, success, txn_ref, response_code, message }` (message tiếng Việt theo bảng mã lỗi VNPay). **Không tạo đơn ở route này**; storefront sẽ gọi `cart.complete`.
- `GET /hooks/vnpay/ipn`: VNPay gọi IPN bằng **GET**, nên cần route riêng (route webhook mặc định của Medusa nhận POST).
  - Kiểm tra chữ ký → tìm giao dịch theo `vnp_TxnRef` → so số tiền → **idempotent** (đã xử lý rồi thì trả `02`).
  - Trả JSON `{ RspCode, Message }`: `00` Confirm Success, `01` Order not found, `02` Order already confirmed, `04` Invalid amount, `97` Invalid signature, `99` Unknown error.
  - Phase 1: nếu cart chưa được complete (khách đóng trình duyệt trước khi về trang kết quả) thì IPN chạy `completeCartWorkflow` cho cart đó (lấy `cart_id` từ `data` của payment session).
  - IPN chỉ chạy được khi backend có URL public. Khi dev thì dùng tunnel (cloudflared/ngrok) nếu người dùng muốn thử, còn không thì luồng return + verify + `cart.complete` vẫn đủ để demo.
- Log mọi giao dịch: txn_ref, số tiền, mã phản hồi, thời gian. Dùng logger của Medusa.

### 8.4 Thẻ test (đưa vào README)
Ngân hàng NCB, số thẻ `9704198526191432198`, tên `NGUYEN VAN A`, ngày phát hành `07/15`, OTP `123456`. Kiểm tra lại trên trang tài liệu sandbox VNPay vì thông tin này có thể thay đổi.

---

## 9. Bảo mật (checklist Phase 1)
- [ ] **Supabase Data API đã tắt** (mục 5.1 bước 3). Kiểm tra lại ở M5 trên cả `pawl-dev` và `pawl-demo`.
- [ ] Không dùng và không lưu anon key, `service_role` key của Supabase ở bất kỳ đâu. Pawl không cần chúng.
- [ ] S3 access key và database password chỉ có trong `apps/backend/.env`. Storefront chỉ có `VITE_MEDUSA_URL` và publishable key của Medusa.
- [ ] Kết nối DB luôn qua SSL (mục 5.2).
- [ ] `STORE_CORS`, `ADMIN_CORS`, `AUTH_CORS` chỉ mở đúng origin.
- [ ] `JWT_SECRET`, `COOKIE_SECRET` lấy từ env, không để giá trị mặc định khi deploy.
- [ ] Kiểm tra chữ ký VNPay bằng so sánh **không phân biệt hoa thường** trên chuỗi hex. Kiểm tra số tiền khớp với số tiền của session.
- [ ] Validate input route custom bằng zod (`validateAndTransformQuery` / `validateAndTransformBody` trong `middlewares.ts`).
- [ ] Không log mật khẩu, token, connection string hay toàn bộ query thanh toán có hash secret.
- [ ] Storefront: không dùng `dangerouslySetInnerHTML` cho dữ liệu từ API (markdown chính sách là nội dung tĩnh của mình).
- [ ] Đơn hàng: chỉ chủ đơn xem được (Store API của Medusa đã lo phần này; route custom phải tự kiểm tra).
- [ ] Bucket `pawl-media` là public, nên **chỉ chứa ảnh công khai**. Không upload hoá đơn hay giấy tờ của khách vào đây.

---

## 10. Phase 2: KHÔNG CODE BÂY GIỜ, chỉ để biết hướng đi

Phase 1 phải chừa đường cho các phần sau (tức là không làm gì cản trở chúng):

1. **Module `pet`**: model Pet (name, species, breed, birth_date, sex, neutered, weight_kg, body_condition, activity_level, allergies[], health_conditions[], food_preference, avatar_url), link Customer ↔ Pet. Ảnh pet upload qua File Module, tức là vào Supabase Storage. Các trang `/account/pets`, `/account/pets/new`, `/account/pets/:id`.
2. **Gợi ý sản phẩm** (rule-based, giải thích được từng gợi ý):
   - Lọc cứng: loài, giai đoạn tuổi, loại sản phẩm chứa chất pet dị ứng (dựa trên tag `free:` và metadata `ingredients`), hết hàng.
   - Chấm điểm 100: sức khoẻ 40, thể trạng 15, dạng ưa thích 15, phản hồi trước đó 10, bán chạy 10, có đặt định kỳ 10.
   - Lượng ăn: `RER = 70 × kg^0.75`, `DER = RER × k`, gram/ngày = `DER / (kcal_per_kg/1000)` → đề xuất tần suất đặt định kỳ.
3. **Module `subscription`**: Subscription / SubscriptionItem / SubscriptionCycle, tần suất 2/4/6 tuần, giảm giá nhẹ, nhắc trước 5 ngày, hạn chốt trước 3 ngày, tạm dừng/bỏ qua/đổi/huỷ; job hằng ngày tạo đơn kỳ sau; thanh toán từng kỳ bằng COD hoặc link VNPay. `line_item.metadata.subscription` được **dành riêng** cho tính năng này. Khi có job chạy định kỳ và deploy nhiều instance thì cân nhắc thêm Redis (Upstash).
4. **GHN** fulfillment provider (`GHN_MODE=mock|sandbox`), tính phí theo địa chỉ, tạo vận đơn.
5. **Chatbot Gemini**: route `POST /store/chat`, function calling chỉ đọc dữ liệu của chính người đang chat, model đặt qua env `GEMINI_MODEL`, API key chỉ ở backend. Tìm kiếm ngữ nghĩa có thể dùng extension `pgvector` có sẵn trên Supabase.
6. **Admin extension**: widget thuộc tính dinh dưỡng trên trang sản phẩm, UI route Subscriptions, UI route Analytics.

---

## 11. Quy ước code
- TypeScript `strict`. Không dùng `any` (trừ khi có comment giải thích).
- Tên file `kebab-case`, component `PascalCase`, hook bắt đầu bằng `use`.
- Storefront: `pages/` chỉ ghép component; logic gọi API nằm trong `features/*/api.ts` + `hooks.ts` (React Query). Query key đặt trong một chỗ cho mỗi feature.
- Mọi chuỗi giao diện là tiếng Việt có dấu. Thông báo lỗi thân thiện, không lộ lỗi kỹ thuật.
- Tiền: luôn qua `formatVND`. Ngày: `dd/MM/yyyy`, múi giờ Asia/Ho_Chi_Minh.
- Màu, khoảng cách, font dùng token Tailwind trong `globals.css` (`@theme`). Giao diện sạch, ấm áp, thân thiện chủ nuôi mèo; tránh trông như template mặc định.
- Không sửa bảng của Medusa trực tiếp trên dashboard Supabase. Mọi thay đổi schema đi qua module và migration của Medusa (`npx medusa db:generate <module>` → `npx medusa db:migrate`).
- Commit theo Conventional Commits (`feat(storefront): …`, `fix(backend): …`). Mỗi milestone ít nhất 1 commit.
- Không tắt ESLint rule để cho qua. Lỗi type thì sửa, không ép kiểu bừa.

## 12. Lệnh nhanh

```bash
# 0) Tạo project Supabase theo docs/supabase-setup.md, điền apps/backend/.env

# backend
cd apps/backend
npm install
npx medusa exec ./src/scripts/check-db.ts       # kiểm tra kết nối Supabase
npx medusa db:migrate
npx medusa exec ./src/scripts/seed.ts
npx medusa exec ./src/scripts/seed-catalog.ts
npx medusa user -e admin@pawl.local -p supersecret
npm run dev                                      # http://localhost:9000/app

# storefront
cd apps/storefront
npm install
npm run dev                                      # http://localhost:5173
```

## 13. Bắt đầu
Bắt đầu bằng **M0**:
1. Kiểm tra phiên bản Node.
2. Hướng dẫn người dùng tạo project Supabase `pawl-dev` theo mục 5.1, chờ họ điền `.env`.
3. Tạo backend (`--skip-db`), cấu hình `medusa-config.ts`, chạy `check-db.ts`, rồi `db:migrate`.
4. Tạo storefront.
5. Kiểm tra theo tiêu chí "Hoàn thành M0" rồi báo cáo theo mục 0.