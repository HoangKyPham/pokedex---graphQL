# 📡 CẨM NANG TOÀN TẬP: KIẾN TRÚC VÀ TỐI ƯU GRAPHQL

Tài liệu tổng hợp tư duy cốt lõi của GraphQL, so sánh với REST API, các thành phần vận hành và 5 kỹ thuật tối ưu/bảo mật bắt buộc phải biết khi đưa dự án lên Production.

---

## 🧭 1. Tư Duy Cốt Lõi & Sự Khác Biệt Với REST API

Trong kiến trúc REST, API được tổ chức xoay quanh các **Endpoints (Đường dẫn URL)** đại diện cho tài nguyên. Trong GraphQL, hệ thống chỉ sử dụng **Một Endpoint duy nhất** (thường là `/graphql`), đóng vai trò như một cổng trung chuyển và Client sẽ tự quyết định cấu trúc dữ liệu mình muốn nhận về.

### ❌ Hạn chế của REST API:
* **Over-fetching (Thừa dữ liệu):** API trả về một Object dữ liệu khổng lồ mặc dù giao diện UI chỉ cần hiển thị một vài trường (ví dụ: Tên hiển thị), gây lãng phí băng thông mạng.
* **Under-fetching (Thiếu dữ liệu):** Một màn hình phức tạp yêu cầu dữ liệu từ nhiều thực thể (Bài viết, Tác giả, Bình luận). Với REST, Client phải nã nhiều request liên tiếp (`/posts/1`, `/users/id`, `/posts/1/comments`) gây lag/giật giao diện.

### 🟢 Giải pháp của GraphQL:
Client gửi một câu truy vấn (Query) mô tả chính xác những cấu trúc dữ liệu mình cần. Server nhận lệnh, đóng gói đúng những trường đó trả về $\rightarrow$ **Không thừa, không thiếu, chỉ trong 1 Request duy nhất.**

---

## 🔄 2. Ba Thao Tác Cơ Bản (Operations)

| Thao tác | Vai trò | Tương đương trong REST | Giao thức kết nối |
| :--- | :--- | :--- | :--- |
| **`Query`** | Đọc dữ liệu từ Server về Client | `GET` | HTTP (POST/GET) |
| **`Mutation`** | Ghi, thay đổi, xóa dữ liệu dưới Database | `POST`, `PUT`, `DELETE` | HTTP (POST) |
| **`Subscription`** | Lắng nghe và đẩy dữ liệu theo thời gian thực | Webhooks / Server-Sent Events | WebSockets |

---

## 🛠️ 3. Bản Đồ 5 Kỹ Thuật Tối Ưu Hệ Thống (Kiến Trúc Đánh Đổi)

Để vận hành GraphQL trong các dự án thực tế quy mô lớn, lập trình viên bắt buộc phải kiểm soát tốt 5 thành phần cốt lõi sau:

### 🌟 3.1. Thiết Kế Đồ Thị Dữ Liệu (Schema & Resolver)
* **Khái niệm:** Frontend và Backend cùng ngồi lại thiết kế file Schema chung (`.graphql`) để định nghĩa cấu trúc dữ liệu dựa trên **nhu cầu hiển thị của UI** (UI-Driven) thay vì dựa trên cấu trúc bảng Database.
* **Ứng dụng:** Dùng phương pháp *Schema-First Design* kết hợp với công cụ như `GraphQL Code Generator` để tự động sinh ra các TypeScript Types nghiêm ngặt cho cả 2 bên.
* **Đánh đổi (Trade-off):**
    * *Được:* Frontend và Backend làm việc độc lập, song song (Frontend có thể mock data chạy trước).
    * *Mất:* Tốn nhiều thời gian thiết kế, họp hành ban đầu. Nếu UI thay đổi cấu trúc quá lớn, Backend sẽ phải sửa lại toàn bộ hệ thống các hàm Resolver liên quan.

### ⚙️ 3.2. Công Cụ DataLoader (Xử Lý Lỗi N+1 Queries)
* **Khái niệm:** Trong GraphQL, mỗi trường được xử lý độc lập bởi một hàm gọi là *Resolver*. Nếu lấy danh sách 10 bài viết kèm tác giả, hệ thống mặc định sẽ nã $1 + 10 = 11$ câu lệnh SQL (Lỗi N+1). **DataLoader** giải quyết bằng cách thu thập tất cả các ID lẻ tẻ trong vài mili-giây, gom lại thành một mảng và nã duy nhất **1 câu lệnh SQL gộp** dùng toán tử `IN`.
* **Ứng dụng:** Bắt buộc phải áp dụng ở mọi mối quan hệ lồng nhau (Bài viết $\rightarrow$ Tác giả, Đơn hàng $\rightarrow$ Sản phẩm).
* **Đánh đổi (Trade-off):**
    * *Được:* Giảm tải cực lớn cho Database, cố định số lượng câu lệnh SQL truy vấn.
    * *Mất:* Tăng bộ nhớ RAM tiêu thụ trên Server Backend để lưu đệm tạm thời. Code Backend phức tạp hơn do phải bọc qua tầng DataLoader thay vì gọi ORM trực tiếp.

### 🔒 3.3. Persisted Queries (Truy Vấn Cố Định & HTTP Cache)
* **Khái niệm:** Ở môi trường Production, Frontend không gửi nguyên chuỗi Query dài dòng lên mạng. Lúc biên dịch (Build), hệ thống sẽ băm (Hash) các câu Query thành mã ngắn (ví dụ: SHA-256 Hash). Khi chạy, Frontend chỉ gửi mã Hash này lên qua phương thức `GET`. Server nhìn mã Hash đối chiếu với danh sách đã lưu để thực thi.
* **Ứng dụng:** Áp dụng khi dự án chạy thật (Production) cần bảo mật và tối ưu tốc độ mạng.
* **Đánh đổi (Trade-off):**
    * *Được:* Bảo mật tuyệt đối (Hacker không thể tự chế câu lệnh phá hoại Server). Ép GraphQL gửi bằng phương thức `GET` giúp các tầng mạng CDN (Cloudflare) có thể **thiết lập Cache** giống như REST.
    * *Mất:* Làm phức tạp hóa quy trình triển khai CI/CD. Nếu Frontend thay đổi hoặc thêm Query mới, danh sách mã Hash phải được cập nhật đồng bộ lên Server trước, nếu không Server sẽ từ chối request của Client mới.

### ⚡ 3.4. Cache Ở Tầng Client (Normalized Cache)
* **Khái niệm:** Các thư viện Frontend lớn (Apollo Client, Urql) sở hữu một bộ nhớ đệm thông minh. Khi dữ liệu đổ về, nó tự bóc tách các Object có trường `id` ra để lưu trữ phẳng dưới dạng key-value (Ví dụ: `User:25`).
* **Ứng dụng:** Dùng khi ứng dụng có nhiều màn hình, nhiều component cùng chia sẻ và hiển thị chung một nguồn dữ liệu dữ liệu.
* **Đánh đổi (Trade-off):**
    * *Được:* Ứng dụng phản hồi tức thì (0ms) khi chuyển qua lại các màn hình cũ mà không cần gọi lại mạng, giảm tải cho Backend.
    * *Mất:* Tiêu tốn bộ nhớ RAM trên thiết bị/trình duyệt của người dùng. Lập trình viên phải đối mặt với bài toán đau đầu: **Xóa bộ nhớ đệm khi nào? (Cache Invalidation)** để tránh người dùng nhìn thấy dữ liệu cũ (Stale data).

### 📊 3.5. Độ Phức Tạp Của Query (Query Complexity)
* **Khái niệm:** Trực tiếp chấm điểm "độ nguy hiểm" của câu Query trước khi chạy (Ví dụ: 1 trường thường = 1 điểm, 1 trường liên kết lồng nhau = 5 điểm). Nếu tổng điểm câu Query vượt quá hạn mức cho phép (Ví dụ: > 50 điểm), Server sẽ từ chối xử lý ngay lập tức.
* **Ứng dụng:** Bắt buộc khi viết *Public API* (Cung cấp API cho bên thứ ba dùng) hoặc hệ thống lớn có nguy cơ bị tấn công từ chối dịch vụ (DDoS) bằng các câu lệnh lồng nhau vô hạn.
* **Đánh đổi (Trade-off):**
    * *Được:* Bảo vệ Server sống sót trước các cuộc tấn công ác ý hoặc lỗi viết Query đệ quy vô hạn từ Frontend.
    * *Mất:* Phải viết code cấu hình chấm điểm phức tạp ở Backend. Frontend khi viết Query phải tính toán kỹ lưỡng, nếu vượt điểm phải tự chia nhỏ Query ra gọi làm nhiều lần.

---

## 🎯 4. Tóm Tắt Chiến Lược Lựa Chọn Cho Dự Án

* **Mô hình Startup / Dự án Nội bộ (Tinh gọn, Nhanh):**
    * *Combo sử dụng:* **Schema Thống Nhất + DataLoader + Cache ở tầng Client**.
    * *Mục tiêu:* Đạt hiệu năng tốt, Frontend phát triển độc lập mượt mà, quy trình deploy tinh gọn tối đa (Chưa cần cài Persisted Queries hay Query Complexity).
* **Mô hình Hệ thống Lớn / Enterprise / Fintech (Quy mô, Bảo mật cao):**
    * *Combo sử dụng:* **Áp dụng toàn bộ cả 5 kỹ thuật trên**.
    * *Mục tiêu:* Bảo mật và an toàn hạ tầng được đặt lên hàng đầu. Sẵn sàng đánh đổi tốc độ phát triển tính năng lấy sự vận hành ổn định và chịu tải tuyệt đối của hệ thống.

---

## 🔒 6. Phân Quyền Bảo Mật (Field-Level Authorization)

### 🔹 Nó là gì trong thực tế?
Trong REST API, việc phân quyền thường được chặn ngay từ "cổng vào" bằng cách đặt một Middleware ở URL (Ví dụ: ai vào đường dẫn `/api/admin/*` thì phải có quyền Admin). 
Trong GraphQL, vì mọi luồng dữ liệu đều đi qua một cổng duy nhất `/graphql`, người dùng có thể đứng từ một Node công khai (ví dụ: `Query.me`) để dùng các mối liên kết đồ thị mò sang một Node nhạy cảm khác. Do đó, việc phân quyền bắt buộc phải làm chi tiết đến **từng trường dữ liệu (Field-Level)** hoặc kiểm tra ngay bên trong các hàm **Resolver**.

### 🚀 Ứng dụng trong dự án
* **Sử dụng khi nào:** Khi hệ thống có cấu trúc phân quyền phức tạp và bảo mật sâu (Ví dụ: Chỉ cấp Quản lý mới được xem trường `salary` và `bonus` của nhân viên, người dùng thông thường chỉ được xem `name` và `position`).
* **Giải pháp thực tế:** Sử dụng các thư viện Middleware cho GraphQL như `graphql-shield` để bọc các quy tắc bảo mật (Permissions) quanh các trục Resolver, hoặc kiểm tra thủ công ngay đầu hàm Resolver:
  ```typescript
  salary: (parentUser, args, context) => {
    if (context.currentUser.role !== "ADMIN") {
      throw new Error("Không có quyền truy cập trường dữ liệu này!");
    }
    return parentUser.salary;
  }

---

## 📂 7. Bài Toán Upload File Trong GraphQL

### 🔹 Nó là gì trong thực tế?
Bản chất giao thức của GraphQL được thiết kế tối ưu để truyền tải dữ liệu dạng văn bản ký tự (JSON text). Nó **không sinh ra để truyền tải dữ liệu nhị phân (Binary data)** dung lượng lớn như hình ảnh, video, hoặc file PDF. 

### 🚀 Ứng dụng trong dự án
Khi làm tính năng đổi ảnh đại diện (Avatar), upload tài liệu đính kèm, cộng đồng công nghệ thực tế áp dụng 2 cách giải quyết:
* **Cách 1 (Dùng GraphQL Multipart Request):** Sử dụng thư viện bổ trợ như `graphql-upload` để ép GraphQL truyền dữ liệu dạng cấu trúc multipart. Cách này khiến Server xử lý rất nặng và dễ bị nghẽn mạch.
* **Cách 2 (Tách biệt hoàn toàn - Khuyên dùng):** Kiến trúc Frontend **không** gửi file qua GraphQL. Thay vào đó, Frontend gọi một Query lên GraphQL để xin một đường dẫn dùng một lần gọi là **Presigned URL** (sinh ra từ các kho lưu trữ như Amazon S3, Google Cloud Storage hoặc Cloudinary). Sau đó, Frontend dùng lệnh `fetch/axios` thuần của trình duyệt để đẩy trực tiếp file lên thẳng kho lưu trữ đó thông qua Presigned URL vừa xin.

### ⚖️ Đánh đổi (Trade-off) của Cách 2 (Presigned URL)
* **Được:** Giữ cho GraphQL Server luôn nhẹ nhàng, sạch sẽ, không tốn tài nguyên phần cứng (RAM/CPU) để xử lý, bóc tách và luân chuyển các tệp tin dung lượng lớn.
* **Mất:** Lập trình viên Frontend phải chia logic xử lý làm 2 bước độc lập (Bước 1: Gọi GraphQL xin URL $\rightarrow$ Bước 2: Upload file lên Cloud) thay vì chỉ bấm nút submit form một lần duy nhất như truyền thống.

---

## 🌐 8. Kiến Trúc Hệ Thống Lớn: Apollo Federation (Microservices)

### 🔹 Nó là gì trong thực tế?
Khi hệ thống của một doanh nghiệp phát triển quá lớn (Enterprise), mã nguồn không thể nhét chung vào một Server duy nhất (Monolith) được nữa vì rất khó quản lý. Hệ thống sẽ được chia nhỏ ra làm các dịch vụ độc lập (Microservices): Service Quản lý User, Service Quản lý Đơn hàng, Service Quản lý Thanh toán.

Lúc này, mỗi Service sẽ tự sở hữu một Schema GraphQL riêng. **Apollo Federation** (hoặc **GraphQL Mesh**) là giải pháp dựng một cổng **Gateway** (hoặc Router) đứng ở ngoài cùng. Cổng này có nhiệm vụ tự động "khâu vá" (Stitch) tất cả các Schema nhỏ của các Service lại thành một Đồ thị dữ liệu khổng lồ duy nhất cho Frontend gọi vào.



### 🚀 Ứng dụng trong dự án
* **Sử dụng khi nào:** Hệ thống ở quy mô lớn, kiến trúc Microservices, có nhiều đội ngũ lập trình (Product Teams) độc lập cùng làm việc trên các mảng nghiệp vụ khác nhau nhưng muốn dùng chung một cổng dữ liệu.

### ⚖️ Đánh đổi (Trade-off)
* **Được:** Các đội Backend hoàn toàn tự do phát triển, triển khai (Deploy) và mở rộng quy mô (Scale) Service của mình mà không sợ va chạm hay ảnh hưởng đến các đội khác. Frontend ở Client vẫn chỉ cần gọi đúng 1 Endpoint duy nhất ở cổng Gateway, giữ nguyên trải nghiệm linh hoạt của GraphQL.
* **Mất:** Chi phí vận hành hạ tầng, hệ thống và DevOps tăng vọt. Việc kiểm tra và tìm vết lỗi (Debugging) khi hệ thống gặp sự cố trở nên vô cùng gian nan vì dữ liệu phải luân chuyển qua nhiều tầng trung gian (Client $\rightarrow$ Gateway Router $\rightarrow$ Microservice $\rightarrow$ Database).

---

## 🏁 Lời Kết: Bản Đồ Tư Duy Khi Lựa Chọn Công Nghệ

Để khép lại toàn bộ hành trình xây dựng kiến trúc dữ liệu, hãy luôn ghi nhớ quy tắc vàng này khi thiết kế dự án:

1. **REST API vẫn rất xuất sắc** cho các ứng dụng CRUD đơn giản, các hệ thống quy mô nhỏ đến vừa, hoặc các Service chỉ làm nhiệm vụ trả file, stream video, xử lý tác vụ nặng.
2. **Lựa chọn GraphQL** khi giao diện người dùng (UI/UX) cực kỳ phức tạp, cấu trúc hiển thị thay đổi liên tục, hoặc hệ thống cần gom dữ liệu từ rất nhiều nguồn, nhiều Database khác nhau về một mối duy nhất.
3. Khi đã quyết định chọn GraphQL, hãy luôn tỉnh táo thiết lập **DataLoader** ngay từ môi trường phát triển (Dev) để bảo vệ Database, và bật **Persisted Queries** khi đưa sản phẩm lên môi trường chạy thật (Production) để tối ưu bảo mật và tốc độ mạng!