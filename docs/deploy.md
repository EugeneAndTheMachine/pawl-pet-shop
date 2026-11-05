# Deploy Pawl lên Internet

| Thành phần | Nơi chạy | Gói |
|---|---|---|
| Storefront (Vite SPA) | **Vercel** | Hobby, miễn phí |
| Backend + Admin (Medusa) | **Azure App Service** (Linux, Node 22), region Southeast Asia (Singapore) | Gói **B1** (1 lõi, 1.75 GB RAM), trả bằng credit **Azure for Students** ($100, không cần thẻ) |
| Database + ảnh | Supabase **`pawl-dev`** (dùng chung với môi trường dev) | Free |
| Build + deploy backend | **GitHub Actions** (`.github/workflows/deploy-backend.yml`) | Miễn phí |

```
Trình duyệt ──▶ https://<tên>.vercel.app ── trang web (file tĩnh)
                   │  /store/*, /auth/*  (proxy, cùng domain)
                   ▼
              https://<app>.azurewebsites.net ── Medusa API + Admin (/app)
                   │
                   ▼
              Supabase pawl-dev (Postgres + Storage)        Gemini API (chatbot)
```

So với lúc dùng Railway, **chỉ chỗ chạy backend thay đổi**. Vercel, proxy cùng domain, Supabase, Gemini và code giữ nguyên.

## Vì sao storefront gọi API qua proxy của Vercel?

Khi chạy production, Medusa đặt session cookie `SameSite=Lax; Secure` (để chống CSRF). Nếu storefront ở `*.vercel.app` gọi thẳng sang `*.azurewebsites.net` thì đó là **hai site khác nhau**: trình duyệt không gửi cookie kèm request, khách đăng nhập xong F5 là mất đăng nhập.

Vì vậy `apps/storefront/vercel.json` chuyển tiếp (rewrite) `/store/*` và `/auth/*` sang backend. Trình duyệt chỉ thấy **một domain** (Vercel), cookie là cookie của chính trang. Storefront để `VITE_MEDUSA_URL` **trống** để gọi API trên chính domain của nó. Proxy cũng tắt cache của Vercel cho API (giỏ hàng, tài khoản là dữ liệu riêng của từng người).

Azure cắt TLS ở bộ cân bằng tải rồi chuyển request vào app bằng HTTP kèm header `X-Forwarded-Proto: https`. Medusa đã bật `trust proxy` nên vẫn nhận ra kết nối là HTTPS và đặt cookie `Secure` bình thường.

Admin (`/app`) mở trực tiếp ở domain Azure.

## Vì sao build bằng GitHub Actions?

`medusa build` (biên dịch server và Admin dashboard) tốn nhiều RAM và thời gian. Workflow build trên máy của GitHub (miễn phí), cài `node_modules` cho bản build rồi đẩy cả gói lên Azure. Azure chỉ việc chạy `npm run start`, không phải build. App chạy thẳng từ file zip (`WEBSITE_RUN_FROM_PACKAGE=1`) nên deploy và khởi động nhanh hơn nhiều so với giải nén hàng chục nghìn file vào ổ mạng của App Service.

Workflow tự chạy khi push lên `main` có thay đổi trong `apps/backend/`. Có thể chạy tay ở tab **Actions**.

## 0. Chuẩn bị

- Code mới nhất đã push lên GitHub (`main`), có file `.github/workflows/deploy-backend.yml`.
- Tạo 2 chuỗi bí mật (mỗi lệnh chạy một lần, chép kết quả lại):
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
  Một chuỗi cho `JWT_SECRET`, một chuỗi cho `COOKIE_SECRET`. Backend từ chối khởi động nếu hai giá trị này ngắn hơn 32 ký tự hoặc là `change-me`.
- Mở sẵn `apps/backend/.env` và `apps/storefront/.env` trên máy để chép giá trị (**chỉ dán vào dashboard**, không gửi qua chat, không commit).

## 1. Kích hoạt Azure for Students

1. Vào https://azure.microsoft.com/free/students → **Start free**.
2. Đăng nhập bằng tài khoản Microsoft (nên dùng email trường, ví dụ `@hcmut.edu.vn`; nếu dùng email cá nhân thì sẽ được yêu cầu xác minh bằng email trường).
3. Điền thông tin, xác minh số điện thoại. **Không cần thẻ.**
4. Xong sẽ có subscription **Azure for Students** với $100 credit dùng trong 12 tháng. Xem số dư ở https://www.microsoftazuresponsorships.com/balance.

## 2. Tạo Web App

1. Vào https://portal.azure.com → **Create a resource** → **Web App** → **Create**.
2. Tab **Basics**:

   | Mục | Giá trị |
   |---|---|
   | Subscription | Azure for Students |
   | Resource Group | **Create new** → `pawl-rg` |
   | Name | ví dụ `pawl-api` (gọi là `<APP_NAME>`) |
   | Secure unique default hostname | Bật hay tắt đều được (bật thì domain có thêm chuỗi ngẫu nhiên, ví dụ `pawl-api-ab12cd.southeastasia-01.azurewebsites.net`) |
   | Publish | **Code** |
   | Runtime stack | **Node 22 LTS** |
   | Operating System | **Linux** |
   | Region | **Southeast Asia** |
   | Linux Plan | **Create new** → `pawl-plan` |
   | Pricing plan | **Basic B1**. Bấm *Explore pricing plans* nếu không thấy. **Không chọn Free F1**: F1 chỉ cho dùng CPU 60 phút mỗi ngày, Medusa không chạy nổi |

   Nếu báo lỗi kiểu `RequestDisallowedByAzure` / region không được phép: subscription sinh viên chỉ cho tạo ở một số region. Xem danh sách ở **Policy** → **Assignments** → assignment về *allowed regions/locations* → tab **Parameters**, rồi chọn theo thứ tự ưu tiên: **Malaysia West** → **Japan East** / **Korea Central** → **Central India** → **Australia East**.

   **Không chọn East Asia (Hồng Kông) hay region nào ở Trung Quốc đại lục:** Gemini API [không hỗ trợ các vùng này](https://ai.google.dev/gemini-api/docs/available-regions), chatbot sẽ luôn báo lỗi. Region của Web App không đổi được sau khi tạo, chọn sai thì phải tạo lại.
3. Tab **Database**: không tạo (đã có Supabase).
4. Tab **Deployment**:
   - Continuous deployment: **Disable** (repo đã có workflow riêng, để Azure tự tạo workflow sẽ bị trùng).
   - Basic authentication: **Enable** (cần để GitHub Actions deploy bằng publish profile).
5. Tab **Monitoring + secure**: Application Insights → **No** (không cần, đỡ tốn credit).
6. **Review + create** → **Create**. Chờ khoảng 1–2 phút → **Go to resource**.
7. Ở trang **Overview**, chép **Default domain** (gọi là `<BACKEND>`, nhớ thêm `https://` phía trước).

## 3. Cấu hình Web App

### 3.1 General settings

**Settings** → **Configuration** → tab **General settings**:

| Mục | Giá trị |
|---|---|
| Startup Command | `npm run start` |
| SCM Basic Auth Publishing Credentials | **On** |
| Always on | **On** (không có thì app bị tắt khi không có ai truy cập, phiên đăng nhập mất theo) |
| Session affinity (ARR affinity) | Off |
| HTTPS Only | On |

Bấm **Save**. Nếu không thấy *HTTPS Only* ở đây thì tìm trong **Settings** → **Configuration** hoặc **TLS/SSL settings**.

### 3.2 Biến môi trường

**Settings** → **Environment variables** → tab **App settings** → **Advanced edit**. Ô soạn thảo hiện một mảng JSON (có thể đã có vài mục sẵn, giữ nguyên chúng). Thêm các mục sau vào trong mảng rồi điền giá trị. Các dòng ghi "như .env" thì chép đúng từ `apps/backend/.env`. Chưa có domain Vercel thì tạm để `https://pawl.vercel.app`, làm xong bước 6 thì sửa lại.

```json
  { "name": "NODE_ENV", "value": "production", "slotSetting": false },
  { "name": "WEBSITE_RUN_FROM_PACKAGE", "value": "1", "slotSetting": false },
  { "name": "SCM_DO_BUILD_DURING_DEPLOYMENT", "value": "false", "slotSetting": false },
  { "name": "WEBSITE_WEBDEPLOY_USE_SCM", "value": "true", "slotSetting": false },
  { "name": "WEBSITES_CONTAINER_START_TIME_LIMIT", "value": "600", "slotSetting": false },

  { "name": "DATABASE_URL", "value": "<như .env: Session pooler của pawl-dev, có ?ssl_mode=disable>", "slotSetting": false },
  { "name": "DB_SSL", "value": "true", "slotSetting": false },

  { "name": "S3_FILE_URL", "value": "<như .env>", "slotSetting": false },
  { "name": "S3_ENDPOINT", "value": "<như .env>", "slotSetting": false },
  { "name": "S3_REGION", "value": "<như .env>", "slotSetting": false },
  { "name": "S3_BUCKET", "value": "pawl-media", "slotSetting": false },
  { "name": "S3_ACCESS_KEY_ID", "value": "<như .env>", "slotSetting": false },
  { "name": "S3_SECRET_ACCESS_KEY", "value": "<như .env>", "slotSetting": false },

  { "name": "JWT_SECRET", "value": "<chuỗi bí mật thứ nhất ở bước 0>", "slotSetting": false },
  { "name": "COOKIE_SECRET", "value": "<chuỗi bí mật thứ hai ở bước 0>", "slotSetting": false },

  { "name": "STORE_CORS", "value": "https://<STOREFRONT>", "slotSetting": false },
  { "name": "ADMIN_CORS", "value": "https://<BACKEND>", "slotSetting": false },
  { "name": "AUTH_CORS", "value": "https://<BACKEND>,https://<STOREFRONT>", "slotSetting": false },
  { "name": "STOREFRONT_URL", "value": "https://<STOREFRONT>", "slotSetting": false },
  { "name": "BACKEND_URL", "value": "https://<BACKEND>", "slotSetting": false },

  { "name": "MEDUSA_FF_CACHING", "value": "true", "slotSetting": false },

  { "name": "GEMINI_API_KEY", "value": "<như .env>", "slotSetting": false },
  { "name": "GEMINI_MODEL", "value": "gemini-3.5-flash-lite", "slotSetting": false },
  { "name": "GEMINI_THINKING_LEVEL", "value": "low", "slotSetting": false },
  { "name": "CHAT_CLIENT_IP_HEADER", "value": "x-forwarded-for", "slotSetting": false }
```

Lưu ý khi dán:
- Mỗi mục cách nhau bằng dấu phẩy, mục cuối cùng **không** có dấu phẩy. Sai cú pháp thì nút OK bị mờ.
- `<BACKEND>` và `<STOREFRONT>` chỉ là domain, **không** có `/` ở cuối.
- **Không** đặt `PORT`: Azure tự đặt (8080) và Medusa đọc biến này.
- **Đừng bỏ sót các biến `S3_*`.** Thiếu chúng thì backend lưu ảnh upload qua Admin vào ổ đĩa của app: ảnh mất sau mỗi lần deploy và link ảnh trỏ về `localhost`.

Bấm **OK** → **Apply** → **Confirm**. App sẽ khởi động lại (lúc này chưa có code, trang mặc định của Azure là bình thường).

Các biến đầu tiên dùng để: chạy app thẳng từ gói zip mà GitHub Actions đẩy lên (`WEBSITE_RUN_FROM_PACKAGE`), không để Azure tự build lại (`SCM_DO_BUILD_DURING_DEPLOYMENT`), bắt buộc với Linux trước khi tải publish profile (`WEBSITE_WEBDEPLOY_USE_SCM`), cho Medusa tối đa 10 phút để khởi động thay vì 230 giây mặc định (`WEBSITES_CONTAINER_START_TIME_LIMIT`).

### 3.3 Bật log

**Monitoring** → **App service logs** → **Application logging**: **File System**, Retention Period (Days): `3` → **Save**. Xem log trực tiếp ở **Monitoring** → **Log stream**.

## 4. Nối GitHub Actions với Azure

1. Trang **Overview** của Web App → **Download publish profile**. Trình duyệt tải về file `<APP_NAME>.PublishSettings`. Nút bị mờ thì xem lại *SCM Basic Auth Publishing Credentials* ở bước 3.1.
2. Trên GitHub, mở repo `pawl-pet-shop` → **Settings** → **Secrets and variables** → **Actions**:
   - Tab **Secrets** → **New repository secret**: Name `AZURE_WEBAPP_PUBLISH_PROFILE`, Secret là **toàn bộ nội dung** file `.PublishSettings` (mở bằng Notepad, chép hết).
   - Tab **Variables** → **New repository variable**: Name `AZURE_WEBAPP_NAME`, Value là `<APP_NAME>` (chỉ tên, ví dụ `pawl-api`, không phải domain).
3. Xoá file `.PublishSettings` trên máy sau khi dán (file này chứa mật khẩu deploy). Không commit file này.
4. Tab **Actions** của repo → workflow **Deploy backend to Azure** → **Run workflow** → **Run workflow**.
   Build mất khoảng 3–5 phút, bước deploy thêm 2–5 phút. Bước *Deploy to Azure App Service* phải có dấu tick xanh (nếu hiện *Deploy skipped* là thiếu secret hoặc variable ở bước 2).
5. Mở **Log stream** trên Azure: lần khởi động đầu mất 1–3 phút. Khi thấy dòng kiểu `Server is ready on port: 8080` là xong.
6. Kiểm tra:
   - `https://<BACKEND>/health` → hiện `OK`.
   - `https://<BACKEND>/app` → đăng nhập Admin bằng tài khoản admin hiện có (cùng database `pawl-dev`).
   - Lỗi thì xem **Log stream** và mục [Sự cố](#8-sự-cố-thường-gặp).

Không cần chạy migration: `pawl-dev` đã được migrate từ máy dev. Khi sau này có migration mới thì chạy `npx medusa db:migrate` trên máy như bình thường.

## 5. Trỏ proxy của storefront về backend

Trong `apps/storefront/vercel.json`, thay **cả hai** chỗ `https://YOUR-BACKEND.azurewebsites.net` bằng `<BACKEND>`, rồi commit và push:

```bash
git add apps/storefront/vercel.json
git commit -m "chore(storefront): point the Vercel proxy at the Azure backend"
git push
```

## 6. Storefront trên Vercel

Đã tạo project Vercel từ trước thì chỉ cần push ở bước 5 là Vercel tự deploy lại, bỏ qua tới bước 6.5.

1. Vào https://vercel.com → **Continue with GitHub**.
2. **Add New…** → **Project** → **Import** repo `pawl-pet-shop`.
3. Cấu hình:

   | Mục | Giá trị |
   |---|---|
   | Project Name | ví dụ `pawl` (domain sẽ là `pawl.vercel.app` nếu còn trống) |
   | Framework Preset | **Vite** (tự nhận) |
   | Root Directory | `apps/storefront` |
   | Build / Output | để mặc định (`npm run build`, `dist`) |
   | Environment Variables | `VITE_MEDUSA_PUBLISHABLE_KEY` = giá trị trong `apps/storefront/.env` |

   **Không** đặt `VITE_MEDUSA_URL`. Nếu đặt thành domain Azure thì khách sẽ không giữ được đăng nhập (xem phần đầu).
4. **Deploy** (khoảng 1 phút). Chép domain chính, ví dụ `https://pawl.vercel.app` (gọi là `<STOREFRONT>`).
5. Quay lại Azure → **Environment variables**: sửa `STORE_CORS`, `AUTH_CORS`, `STOREFRONT_URL` theo `<STOREFRONT>` thật → **Apply**. App tự khởi động lại.

Từ giờ mỗi lần push lên `main`: Vercel build lại storefront; GitHub Actions build và deploy lại backend nếu có thay đổi trong `apps/backend/`.

## 7. Kiểm tra sau khi deploy

Mở `<STOREFRONT>` (tốt nhất bằng cửa sổ ẩn danh) và đi lần lượt:

- [ ] Trang chủ, danh mục, chi tiết sản phẩm hiện đúng giá và ảnh. Mở thẳng một link sâu (ví dụ `<STOREFRONT>/products/...`) rồi F5 → không bị 404.
- [ ] Thêm vào giỏ → checkout COD → ra trang xác nhận đơn.
- [ ] Checkout bằng QR → bấm xác nhận đã chuyển khoản → có đơn.
- [ ] Đăng ký → đăng nhập → **F5 vẫn còn đăng nhập** → `/account/orders` thấy đơn.
- [ ] Bấm **Ask Pawl** → hỏi một câu → có trả lời và thẻ sản phẩm.
- [ ] `<BACKEND>/app` → Admin thấy các đơn vừa đặt; upload thử một ảnh sản phẩm → ảnh hiện (nằm trong bucket `pawl-media`).
- [ ] DevTools → Network: các request API đi tới `<STOREFRONT>/store/...` (không phải domain Azure); Application → Cookies: có `connect.sid` của domain `<STOREFRONT>`.
- [ ] Mở trên điện thoại thật.

Email (xác nhận đơn, link đặt lại mật khẩu) vẫn được **in ra log**: xem ở Azure → **Log stream**.

## 8. Sự cố thường gặp

| Triệu chứng | Cách xử lý |
|---|---|
| Bước deploy trên GitHub Actions lỗi `401 Unauthorized` / `Failed to fetch credentials` | Chưa bật *SCM Basic Auth Publishing Credentials* (bước 3.1), hoặc publish profile đã cũ: tải lại và cập nhật secret |
| Workflow hiện *Deploy skipped* | Thiếu secret `AZURE_WEBAPP_PUBLISH_PROFILE` hoặc variable `AZURE_WEBAPP_NAME` (bước 4.2) |
| Mở `<BACKEND>` thấy trang mặc định của Azure | Chưa deploy, hoặc chưa đặt `WEBSITE_RUN_FROM_PACKAGE=1` trước khi deploy: kiểm tra biến rồi chạy lại workflow |
| `Application Error` / log có `Container ... didn't respond to HTTP pings on port: 8080` | Medusa bị lỗi khi khởi động: đọc dòng lỗi ngay phía trên trong **Log stream**. Hay gặp nhất là thiếu biến môi trường hoặc chưa đặt *Startup Command* `npm run start` |
| Log có `JWT_SECRET must be a random string…` | Chưa đặt hoặc đặt quá ngắn `JWT_SECRET`/`COOKIE_SECRET` |
| Log có `EROFS: read-only file system` | Có đoạn code ghi file vào thư mục app (chạy từ zip là chỉ đọc). Kiểm tra đã đặt đủ biến `S3_*`; nếu vẫn lỗi thì đổi `WEBSITE_RUN_FROM_PACKAGE` thành `0` rồi chạy lại workflow (deploy sẽ chậm hơn) |
| Storefront báo lỗi tải dữ liệu, request `/store/...` trả 404 hoặc 502 | `vercel.json` chưa thay `YOUR-BACKEND` (bước 5), hoặc backend đang khởi động lại: mở `<BACKEND>/health` |
| Đăng nhập được nhưng F5 là mất | Đã đặt `VITE_MEDUSA_URL` trên Vercel: xoá biến đó rồi **Redeploy** |
| Đăng nhập Admin báo lỗi CORS | `ADMIN_CORS` và `AUTH_CORS` phải có `https://<BACKEND>` (không có `/` ở cuối) |
| Không kết nối được database / `password authentication failed` | Chép lại đúng `DATABASE_URL` và `DB_SSL=true`; kiểm tra `pawl-dev` không bị tạm dừng trên dashboard Supabase |
| `remaining connection slots are reserved` / `too many clients` | Gói Free có 15 kết nối cho cả project. Backend trên Azure dùng 5, mỗi máy chạy `npm run dev` dùng thêm 5: tối đa 2 máy dev chạy cùng lúc |
| Tạo Web App báo `RequestDisallowedByAzure` | Subscription sinh viên không cho dùng region đó: chọn region khác (bước 2) |
| Chatbot báo "busy" | Gemini đang quá tải (503) hoặc hết quota, thử lại sau |
| Chatbot luôn báo "could not answer", log có `[chat] failed … status=400 … User location is not supported` | Web App nằm ở region Gemini không hỗ trợ (ví dụ East Asia/Hồng Kông). Tạo lại Web App ở region được hỗ trợ (bước 2) |
| Chatbot báo "not available", log có `GEMINI_API_KEY is not set` | Thiếu biến `GEMINI_API_KEY` trên Azure |

## 9. Chi phí và lưu ý

- **Chi phí:** gói B1 Linux khoảng $13/tháng (xem giá chính xác cho region đã chọn ở https://azure.microsoft.com/pricing/details/app-service/linux/), trừ vào $100 credit. Theo dõi ở **Cost Management** hoặc trang số dư ở bước 1. Hết credit thì Azure tắt tài nguyên, **không tự trừ tiền** của bạn.
- **Dọn dẹp sau khi chấm bài:** xoá resource group `pawl-rg` (xoá cả Web App lẫn App Service Plan). Chỉ bấm *Stop* Web App thì **plan B1 vẫn tính tiền**.
- **Phiên đăng nhập lưu trong bộ nhớ** (chưa dùng Redis): mỗi lần backend deploy lại hoặc khởi động lại (kể cả khi Azure bảo trì định kỳ), khách và admin phải đăng nhập lại. Giỏ hàng không mất (nằm trong database). Muốn giữ phiên thì thêm Redis (ví dụ Upstash) và đặt `REDIS_URL`.
- **Web public dùng chung database `pawl-dev`** với máy dev của cả nhóm: dữ liệu thử nghiệm trên máy dev sẽ hiện trên web, và ngược lại. Không chạy script phá dữ liệu khi đang demo.
- **Supabase Free** tạm dừng project sau 7 ngày không hoạt động. Có web public truy cập thường xuyên thì ít gặp, nhưng trước buổi demo vẫn nên vào dashboard kiểm tra.
- **Phương án khác:** nếu không dùng được Azure, backend vẫn chạy được trên Railway (gói Hobby $5/tháng) với cùng biến môi trường: Root Directory `/apps/backend`, Build `npm run build && cd .medusa/server && npm install`, Start `cd .medusa/server && npm run start`, Healthcheck `/health`, thêm `PORT=9000`, rồi trỏ `vercel.json` về domain Railway.
- Đây là **dự án học tập**: thanh toán QR là giả lập, không nhận tiền thật.
