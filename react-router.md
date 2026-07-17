# 📘 CẨM NANG TOÀN TẬP: REACT ROUTER V7 (FRAMEWORK MODE)

Tài liệu tổng hợp kiến trúc Full-stack, Luồng dữ liệu (Data Flow), và các kỹ thuật tối ưu giao diện trạng thái chờ (Pending UI) trong React Router v7.

---

## 🗺️ 1. Hệ Thống Định Tuyến (Routing)

File `app/routes.ts` đóng vai trò là **Single Source of Truth** (Nơi quản lý tập trung duy nhất toàn bộ cấu trúc URL). Toàn bộ ứng dụng được định nghĩa tường minh thông qua 3 hàm helper chính:

* **`index("path/to/file")`**: Định nghĩa trang mặc định (Trang chủ `/`).
* **`route("pattern", "path/to/file")`**: Định nghĩa tuyến đường tĩnh (`/search`) hoặc tuyến đường động chứa tham số dạng dấu hai chấm (`/posts/:id`).
* **`layout("path/to/layout", [routes])`**: Định nghĩa khung giao diện dùng chung (Header, Sidebar). Bản thân nó không tự sinh ra URL mà đóng vai trò bọc ngoài các trang con. Trang con sẽ tự động được "bơm" vào vị trí thẻ **`<Outlet />`** nằm trong file Layout.

---

## 🏗️ 2. Cấu Trúc Một File Route Chuẩn (Full-stack Module)

Mỗi file trong thư mục `routes/` hoạt động như một bộ điều phối (Controller) Full-stack nhỏ gọn, có thể export 5 thành phần cốt lõi:

1.  **`loader` (Backend)**: Hàm chỉ chạy trên Server, chịu trách nhiệm nạp dữ liệu (gọi Database, API bảo mật) trước khi giao diện được vẽ. Giúp triệt tiêu trạng thái "Loading..." giật màn hình của SPA truyền thống.
2.  **`default` (Frontend)**: Component React chính, chạy trên cả Server (SSR) và Client (Hydration). Nhận dữ liệu `loaderData` qua props để render UI công khai.
3.  **`meta` (SEO)**: Cấu hình tiêu đề, thẻ `<meta>`, Open Graph động cho từng trang dựa trên chính dữ liệu mà `loader` vừa nạp được.
4.  **`ErrorBoundary` (Bảo trì)**: Đánh chặn và xử lý lỗi cô lập theo từng Route. Nếu trang con bị sập, hệ thống chỉ render giao diện lỗi tại đúng vị trí đó, các phần chung như Header/Sidebar của Layout cha vẫn hoạt động bình thường.
5.  **`headers` (Tối ưu HTTP)**: Can thiệp và cấu hình các thẻ HTTP Response Headers (ví dụ: `Cache-Control` nhằm lưu bộ nhớ đệm trên trình duyệt/CDN).

> 🌟 **An toàn kiểu dữ liệu (Type-safe):** Framework Mode tự động sinh mã ẩn trong thư mục `.+types/`. Bạn chỉ cần `import type { Route } from "./+types/tên_file"` để ép kiểu nghiêm ngặt cho `params` và `loaderData` mà không cần viết interface thủ công.

---

## ⚡ 3. Cơ Chế Nạp Dữ Liệu (Data Loading)

React Router luôn nạp dữ liệu xong xuôi trên Server trước khi trả HTML về trình duyệt, đảm bảo tốc độ tải trang nhanh và tối ưu SEO.

### Tham số đầu vào của Loader
Hàm `loader` nhận một Object chứa hai thuộc tính quan trọng để lọc dữ liệu:
* **URL Params**: Bắt các biến động từ URL (Ví dụ với `/posts/:id` $\rightarrow$ lấy qua `params.id`).
* **Query Parameters**: Đọc các chuỗi tìm kiếm (Ví dụ với `/posts?page=2` $\rightarrow$ chuyển đổi qua `new URL(request.url)` để bóc tách).

### Đánh chặn lỗi 404
Nếu không tìm thấy dữ liệu trong Database, hãy sử dụng cú pháp `throw new Response("...", { status: 404 })`. Hệ thống sẽ lập tức dừng luồng chạy thông thường và kích hoạt component `ErrorBoundary`.

### Kỹ thuật Trì hoãn nạp dữ liệu (`defer`)
Khi có một câu lệnh truy vấn quá chậm (ví dụ: nạp danh sách 10.000 bình luận), việc bắt cả trang web chờ đợi sẽ làm giảm trải nghiệm người dùng.
* **Giải pháp**: Sử dụng hàm `defer()` để trả ngay các dữ liệu nhanh (nội dung bài viết), còn dữ liệu chậm trả về dạng một `Promise` chưa giải quyết.
* **Phía UI**: Kết hợp các thẻ `<Suspense>` và `<Await>` của React để hiển thị hiệu ứng skeleton/loading ngầm cho riêng phân đoạn dữ liệu chậm đó.

---

## 🏎️ 4. Cơ Chế Ghi Dữ Liệu (Actions)

Nếu `loader` là Đọc dữ liệu (GET) thì **`action`** chính là mảnh ghép đảm nhận vai trò **Ghi/Thay đổi dữ liệu (POST, PUT, DELETE)**.

### Bộ đôi vận hành
* **Tại Client**: Sử dụng component **`<Form method="post">`** (Chữ F viết hoa). Khi submit, React Router chặn sự kiện tải lại trang, tự động gom các ô input có thuộc tính `name` thành đối tượng `FormData` và gửi `fetch` ngầm lên server.
* **Tại Server**: Hàm `async function action()` đón lấy yêu cầu, bóc tách dữ liệu và trực tiếp thao tác ghi/sửa/xóa dưới Database.

### Luồng đời dữ liệu khép kín (Full-stack Data Lifecycle)
1. **Submit**: Trình duyệt gửi dữ liệu Form ngầm thông qua `<Form>`.
2. **Execute**: Hàm `action()` trên Server tiếp nhận và cập nhật Database thành công.
3. **🌟 Tự động Revalidation**: Ngay sau khi `action` kết thúc, React Router tự hiểu dữ liệu gốc đã thay đổi $\rightarrow$ Nó **tự động gọi lại tất cả các hàm `loader`** của các trang đang hiển thị để đồng bộ giao diện mới nhất. Lập trình viên không cần viết code reload thủ công.

---

## 🔔 5. Điều Hướng Và Quản Lý Trạng Thái Chờ (Navigating & Pending UI)

Hệ thống cung cấp các công cụ kiểm soát luồng di chuyển và tối ưu giao diện trong lúc chờ Server xử lý:

| Công cụ | Phân loại | Vai trò & Ứng dụng thực tế |
| :--- | :--- | :--- |
| **`<Link>`** | Component | Thay thế thẻ `<a>` gốc, giúp chuyển trang lập tức ở Client không bị tải lại toàn bộ trang web. |
| **`<NavLink>`** | Component | Phiên bản thông minh của `<Link>`, tự động cung cấp trạng thái `isActive` để làm nổi bật màu chữ/nền khi URL trùng khớp (Dùng cho Navbar/Sidebar). |
| **`useNavigate()`** | Hook | Điều hướng bằng mã lệnh (Programmatic Navigation) sau khi hoàn thành một logic nào đó (Ví dụ: Đăng nhập thành công $\rightarrow$ điều hướng về trang chủ). |
| **`useNavigation()`** | Hook | Theo dõi trạng thái kết nối mạng của toàn trang. Kiểm tra `navigation.state === "loading"` để hiển thị thanh tiến trình chạy trên top hoặc làm mờ trang web khi đang nạp trang mới. |
| **`useActionData()`** | Hook | Hứng dữ liệu hoặc thông điệp trả về từ hàm `action` trên server (Thường dùng để hiển thị lỗi Validation của Form). |
| **`useFetcher()`** | Hook | Gửi các action hoặc loader ngầm biệt lập, **hoàn toàn không làm thay đổi URL/địa chỉ trang hiện tại** (Ứng dụng cho nút Thả tim ❤️, nút Xóa nhanh 1 dòng). |

> 💡 **Mẹo gộp hành động:** Để phân biệt nhiều hành động trong cùng một Form (ví dụ: nút *Lưu nháp* và nút *Xuất bản*), hãy đặt thuộc tính `name` và `value` vào chính các nút bấm đó (Ví dụ: `<button name="intent" value="draft">`). Tại hàm `action` trên server, dùng `formData.get("intent")` để rẽ nhánh xử lý.

---

## 🧼 6. Chiến Lược Tổ Chức Thư Mục Dự Án Lớn (Clean Architecture)

Để tránh tình trạng file Route bị phình to (Fat Files) dẫn tới khó bảo trì khi dự án phát triển, hãy luôn tuân thủ nguyên tắc: **Route làm nhiệm vụ điều phối dữ liệu, UI phức tạp bóc ra thư mục riêng.**

```text
app/
├── components/          <-- Nơi chứa các UI Component thuần túy (Siêu sạch, không dính dáng loader)
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogGrid.tsx
│   │   └── CommentSection.tsx
│   └── ui/              <-- Các nút bấm, input, modal dùng chung (Ví dụ từ thư viện shadcn/ui)
│
├── routes/              <-- Nơi gom chung (Chỉ làm nhiệm vụ gắn kết Loader/Action và bọc khung)
│   ├── posts.tsx        <-- Gọi component <BlogGrid /> và truyền dữ liệu qua Props
│   └── post-detail.tsx  <-- Gọi component <CommentSection />
│
└── routes.ts            <-- Bản đồ định tuyến (Single Source of Truth)

optimistic UI ki thuat hien thi truoc khi du lieu duoc cap nhat tren server => tang trai nghiem nguoi dung (su dung fetch.formData)
