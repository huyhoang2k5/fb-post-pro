# FB Post Pro - Web App Quản Lý Đăng Bài Facebook Cho Sale & Marketing

Hệ thống quản lý đăng bài Facebook đa kênh chuyên nghiệp dành cho nhân sự Sale & Marketing. Ứng dụng hỗ trợ đăng nhập bằng **Meta OAuth chính thức**, quản lý đồng bộ các Facebook Pages và Facebook Groups mà tài khoản có quyền truy cập, tạo bài đăng đính kèm đa ảnh, phân phối tới nhiều đích đến đồng thời, đặt lịch đăng, quản lý chiến dịch, sản phẩm, mẫu bài và kiểm toán tiến trình (job audit logs) minh bạch.

---

## 🌟 Tính năng Nổi bật

1. **Đăng nhập Meta OAuth 2.0 Chính thức:**
   - Sử dụng cơ chế đăng nhập chính thức của Meta (Facebook Login for Business).
   - Quy đổi tự động từ short-lived token sang **Long-Lived User Access Token** (thời hạn 60 ngày).
   - Lấy và lưu trữ **Page Access Token độc lập** cho từng Trang quản trị (Page access token không hết hạn theo tài khoản).
   - **Tuyệt đối tuân thủ chính sách của Meta:** Không lưu mật khẩu Facebook, không dùng cookie/session lậu, không dùng private API hay kỹ thuật bypass.

2. **Quản lý Đích đến Đa kênh (Pages & Groups):**
   - Tự động đồng bộ toàn bộ Pages và Groups mà tài khoản có quyền truy cập qua Graph API v20.0+.
   - Phân loại rõ ràng khả năng đăng bài: Trang (hỗ trợ tự động qua API) vs Nhóm (hỗ trợ qua Trợ lý đăng bài).

3. **Cơ chế Xử lý Giới hạn Meta Group API (Graph API v19.0+):**
   - Theo chính sách chính thức của Meta từ tháng 04/2024, quyền đăng bài trực tiếp vào Facebook Group đối với ứng dụng bên thứ 3 đã bị hạn chế nghiêm ngặt.
   - Khi chọn đăng vào Group, hệ thống chuyển trạng thái job sang **`MANUAL_ACTION_REQUIRED`** và hiển thị thông báo theo đúng quy chuẩn:
     > **"Group này không hỗ trợ đăng tự động bằng API hiện tại."**
   - Cung cấp ngay **Trợ lý thao tác nhanh 3 bước**:
     - `Copy Content`: Sao chép toàn bộ tiêu đề, nội dung, link và hotline vào bộ nhớ tạm.
     - `Download Images`: Tải nhanh tất cả ảnh đính kèm của bài viết.
     - `Open Group`: Mở trực tiếp link Facebook Group để người dùng dán bài đăng trong 3 giây.
     - Nút `Đã đăng thủ công` để lưu lại trạng thái hoàn tất vào nhật ký.

4. **Tạo Bài Đăng Đa Ảnh & Tích hợp Sản phẩm, Mẫu bài:**
   - Tiêu đề, nội dung chi tiết, link CTA, thông tin liên hệ (Zalo, Hotline).
   - Đính kèm nhiều hình ảnh (hệ thống tự động upload dạng unpublished photos và ghép thành album feed post chuẩn Meta).
   - Chọn sản phẩm từ danh mục: Tự động điền giá, link và ảnh sản phẩm.
   - Chèn mẫu bài viết sale: Hỗ trợ biến số `{tên_sản_phẩm}`, `{giá}`, `{link}`, `{liên_hệ}`.
   - Xem trước giao diện thực tế (Live Facebook Feed Card Mockup) theo thời gian thực.

5. **Theo dõi Tiến trình Độc lập (PostJob & PostJobLog):**
   - Nếu bạn chọn đăng vào 20 Trang/Nhóm cùng lúc, hệ thống sẽ sinh ra **20 jobs độc lập**.
   - Trạng thái chuẩn:
     - `PENDING`: Đang chờ tới lượt trong hàng đợi.
     - `PROCESSING`: Đang kết nối Meta Graph API để upload ảnh và publish.
     - `PUBLISHED`: Đăng thành công (kèm Facebook Post ID và link xem bài).
     - `FAILED`: Gặp lỗi từ Meta (lưu mã lỗi và nguyên nhân chi tiết).
     - `MANUAL_ACTION_REQUIRED`: Cần thao tác thủ công (cho Group hoặc Trang thiếu quyền).
     - `CANCELLED`: Đã hủy.
   - Thanh tiến độ (Progress bar) nhiều phân khúc trực quan cho từng bài viết.
   - Drawer kiểm tra nhật ký (Job Inspector) xem từng payload request/response của Meta.

6. **Đăng ngay hoặc Lên lịch (Scheduling):**
   - Lựa chọn đăng ngay hoặc đặt lịch theo ngày giờ tương lai (múi giờ `Asia/Ho_Chi_Minh`).
   - Quản lý lịch trình trên giao diện Timeline/Calendar.

7. **Hạ tầng Background Queue Linh hoạt:**
   - Hỗ trợ **BullMQ + Redis** cho môi trường production tải cao.
   - Tự động fallback sang **Database In-Process Runner** nếu môi trường phát triển chưa bật Redis, đảm bảo hệ thống luôn vận hành thông suốt mà không crash.
   - Tự động điều phối khoảng nghỉ (Delay 2.5 - 3s) giữa mỗi job để bảo vệ tài khoản khỏi thuật toán chống spam của Facebook.

---

## 🏗️ Kiến trúc & Công nghệ

- **Framework:** Next.js (App Router, React 18, TypeScript)
- **Styling & UI:** Tailwind CSS, Lucide Icons, Modern SaaS Responsive Layout
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth.js (Auth.js) + Meta OAuth 2.0
- **Background Jobs:** BullMQ + Redis (kèm In-Process Worker Fallback)
- **Media Storage:** Hỗ trợ Cloudinary và Local Multipart Storage (`/public/uploads`)
- **Meta SDK:** Official Meta Graph API v20.0+ (Axios REST Integration)

---

## 📋 Database Schema (13 Bảng Thực Thể)

```text
User                  - Thông tin nhân viên, tài khoản hệ thống
FacebookConnection    - Tài khoản Facebook liên kết, Long-Lived User Token, thời hạn
Destination           - Danh sách Pages và Groups Facebook, Page Access Token
Product               - Danh mục sản phẩm kinh doanh (SKU, giá, mô tả, ảnh, link)
Media                 - Thư viện ảnh tải lên
Post                  - Bài đăng gốc (tiêu đề, nội dung, sản phẩm, chiến dịch)
PostMedia             - Bảng liên kết nhiều ảnh cho bài viết (thứ tự sắp xếp)
Template              - Mẫu bài viết bán hàng có placeholder ({tên_sản_phẩm}, {giá}...)
Campaign              - Chiến dịch tiếp thị gom nhóm bài viết
PostJob               - Tiến trình đăng bài riêng biệt cho từng Destination
PostJobLog            - Nhật ký chi tiết từng bước của từng job (INFO, WARN, SUCCESS, ERROR)
Schedule              - Lịch hẹn giờ xuất bản bài đăng
AuditLog              - Nhật ký kiểm toán thao tác người dùng trên hệ thống
```

---

## 🚀 Hướng Dẫn Cấu Hình Meta Developer App

Để ứng dụng có thể kết nối với tài khoản Facebook cá nhân của bạn, hãy thực hiện các bước sau trên cổng nhà phát triển của Meta:

### Bước 1: Tạo App trên Meta for Developers
1. Truy cập [https://developers.facebook.com/apps/](https://developers.facebook.com/apps/) và đăng nhập bằng tài khoản Facebook của bạn.
2. Bấm nút **Create App** (Tạo ứng dụng).
3. Chọn loại ứng dụng: **Business** (Doanh nghiệp) hoặc **Other** (Khác).
4. Đặt tên ứng dụng (ví dụ: `FB Post Pro Marketing Suite`) và điền email liên hệ của bạn.

### Bước 2: Thêm Sản Phẩm Facebook Login
1. Trong Dashboard của App vừa tạo, tìm mục **Facebook Login for Business** và bấm **Set Up** (Thiết lập).
2. Vào mục **Settings** (Cài đặt) của Facebook Login (bên thanh menu trái).
3. Tại ô **Valid OAuth Redirect URIs** (URI chuyển hướng OAuth hợp lệ), nhập:
   ```text
   http://localhost:3000/api/facebook/callback
   ```
4. Bấm **Save Changes** (Lưu thay đổi).

### Bước 3: Cấu hình Quyền (Permissions)
Trong mục **App Review > Permissions and Features** (hoặc trong cửa sổ cấu hình Login), đảm bảo các quyền sau được bật:
- `public_profile` (Lấy tên và ảnh đại diện Facebook)
- `email` (Lấy email liên hệ)
- `pages_show_list` (Lấy danh sách các Fanpage bạn quản lý)
- `pages_read_engagement` (Đọc thông tin tương tác của Page)
- `pages_manage_posts` (Đăng bài viết và ảnh lên Page)
- `pages_manage_metadata` (Đồng bộ cấu hình Page)
- `groups_access_member_info` (Đọc thông tin nhóm cơ bản)

> **💡 Lưu ý quan trọng về Chế độ Development (Đang phát triển):**  
> Khi ứng dụng ở chế độ Development Mode, **chính tài khoản Facebook của bạn (chủ sở hữu App) và các tài khoản được thêm trong mục App Roles (Quản trị viên / Nhà phát triển / Tester) CÓ THỂ ĐĂNG NHẬP VÀ CẤP TOÀN BỘ QUYỀN TRÊN MÀ KHÔNG CẦN CHỜ META XÉT DUYỆT (APP REVIEW)**. Bạn có thể sử dụng thật ngay lập tức!

### Bước 4: Lấy App ID & App Secret
1. Vào **App Settings > Basic** (Cài đặt ứng dụng > Thông tin cơ bản).
2. Sao chép **App ID** và bấm *Show* để sao chép **App Secret**.
3. Dán 2 giá trị này vào file `.env` của dự án (xem mục tiếp theo).

---

## 🛠️ Hướng Dẫn Cài Đặt & Chạy Ứng Dụng

### 1. Chuẩn bị Môi trường
Dự án yêu cầu:
- **Node.js:** v18 trở lên (Khuyến nghị Node.js 20 hoặc 24).
- **PostgreSQL:** Có thể dùng Docker, Local PostgreSQL, hoặc các dịch vụ Cloud miễn phí như [Neon.tech](https://neon.tech) / [Supabase](https://supabase.com).
- **Redis (Tùy chọn):** Có thể bật qua Docker Compose hoặc dùng in-process runner có sẵn.

### 2. Khởi động Database & Redis qua Docker (Nếu có Docker)
Nếu máy bạn đã cài Docker:
```bash
docker compose up -d
```
Lệnh trên sẽ khởi chạy:
- PostgreSQL 16 tại cổng `localhost:5432` (User: `postgres`, Pass: `postgrespassword`, DB: `fb_post_pro`)
- Redis 7 tại cổng `localhost:6379`

*Nếu không dùng Docker, bạn có thể tạo 1 database PostgreSQL miễn phí trên [Neon.tech](https://neon.tech) trong 30 giây và lấy chuỗi `DATABASE_URL` dán vào `.env`.*

### 3. Cấu hình Biến Môi Trường (`.env`)
Mở file `.env` trong thư mục dự án và cập nhật:

```env
# Database PostgreSQL
DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/fb_post_pro?schema=public"

# Redis BullMQ
REDIS_URL="redis://localhost:6379"

# NextAuth URL & Secret
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="fb_post_pro_super_secure_key_12345"

# Meta Developer App Credentials (Lấy ở Bước 4 trên Meta Developer)
FACEBOOK_APP_ID="YOUR_FACEBOOK_APP_ID"
FACEBOOK_APP_SECRET="YOUR_FACEBOOK_APP_SECRET"
FACEBOOK_REDIRECT_URI="http://localhost:3000/api/facebook/callback"

# Optional Cloudinary (Nếu muốn lưu ảnh đám mây thay vì ổ cứng local)
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Đẩy Schema vào Database & Seed Dữ liệu mẫu
Chạy lệnh đẩy cấu trúc bảng vào database:
```bash
npm run prisma:push
```

Sau đó chạy lệnh khởi tạo các mẫu bài viết sale và sản phẩm ban đầu:
```bash
npm run seed
```

### 5. Khởi động Web App
Chạy máy chủ Next.js:
```bash
npm run dev
```

Mở trình duyệt tại: **[http://localhost:3000](http://localhost:3000)**

*(Tùy chọn) Chạy Background Worker độc lập trong một cửa sổ terminal khác:*
```bash
npm run worker
```

---

## 🎯 Kịch bản Sử Dụng Thực Tế

1. **Bước 1:** Mở trang **Kết nối Facebook** (`/connections`). Bấm nút xanh **"Đăng nhập bằng Facebook (Meta OAuth)"**.
2. **Bước 2:** Meta sẽ hiển thị màn hình cấp quyền chính thức. Bạn tích chọn các Trang (Pages) và cấp quyền đăng bài (`pages_manage_posts`).
3. **Bước 3:** Sau khi xác thực, hệ thống chuyển hướng về website, tự động lưu Long-Lived Token và đồng bộ danh sách tất cả các Trang và Nhóm của bạn vào mục **Group / Page** (`/destinations`).
4. **Bước 4:** Mở trang **Tạo bài** (`/create-post`):
   - Nhập tiêu đề, nội dung bài viết.
   - Có thể chọn nhanh Sản phẩm hoặc Mẫu bài sale để tự động chèn nội dung.
   - Tải lên nhiều hình ảnh hoặc dán link ảnh.
   - Tích chọn đồng loạt nhiều Trang và Nhóm (ví dụ 10 Pages, 10 Groups).
   - Chọn "Đăng ngay" hoặc "Đặt lịch đăng".
   - Bấm **"Đăng ngay (20 nơi)"**.
5. **Bước 5:** Hệ thống tự động sinh 20 jobs riêng biệt. Bạn có thể theo dõi thanh tiến độ (Progress bar) theo thời gian thực tại trang **Bài đăng** (`/posts`) hoặc **Lịch sử** (`/history`).
6. **Bước 6:**
   - Các Fanpage sẽ được đăng tự động tức thì.
   - Với các Group Facebook, hệ thống đánh dấu trạng thái `MANUAL_ACTION_REQUIRED`. Bạn bấm nút **"Trợ lý Group"** để Copy nội dung, Tải ảnh và Mở Group dán nhanh trong 3 giây.
   - Bấm nút **"Log"** trên bất kỳ job nào để xem chi tiết log của Meta API.

---

## 📄 Bản Quyền & Giấy Phép
Dự án được xây dựng phục vụ nhu cầu thực tế của nhân viên Sale & Marketing, tuân thủ tiêu chuẩn Meta Graph API v20.0+.
