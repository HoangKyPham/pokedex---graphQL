# Tổng quan về Apollo Client

**Apollo Client** là một thư viện quản lý trạng thái (state management) toàn diện dành cho JavaScript, được thiết kế đặc biệt để kết nối và quản lý dữ liệu giữa ứng dụng Frontend (React, Vue, Angular,...) với **GraphQL API**.

---

## 🚀 Các tính năng cốt lõi (Key Features)

### 1. Bộ nhớ đệm thông minh (Normalized Caching)
- Tự động phân tách và lưu trữ dữ liệu dưới dạng phẳng (flatten) theo cơ chế cặp `__typename:id`.
- **Lợi ích:** Tự động đồng bộ và cập nhật giao diện ở mọi nơi trên ứng dụng ngay khi dữ liệu của object đó thay đổi, giảm thiểu số lượng request trùng lặp lên server.

### 2. Quản lý trạng thái khai báo (Declarative Data Fetching)
- Cung cấp sẵn các React Hooks chuẩn hóa như `useQuery`, `useLazyQuery`, `useMutation`.
- Tự động quản lý và trả về các trạng thái của request: `loading`, `error`, và `data`.

### 3. Tương tác tức thì (Optimistic UI)
- Cho phép giả định kết quả thành công từ API để cập nhật giao diện ngay lập tức (giảm độ trễ cho trải nghiệm người dùng).
- Tự động đảo ngược trạng thái (rollback) về ban đầu nếu server phản hồi thất bại.

### 4. Quản lý State nội bộ (Local State Management)
- Thay thế hoàn toàn cho Redux, Zustand hoặc Context API.
- Cho phép lưu trữ dữ liệu local (theme, trạng thái đóng/mở modal, giỏ hàng...) ngay trong Apollo Cache bằng `Reactive Variables` hoặc `@client` directive.

### 5. Hỗ trợ Phân trang nâng cao (Pagination)
- Tích hợp sẵn hàm `fetchMore` giúp xử lý các tính năng phân trang phức tạp hoặc cuộn vô hạn (Infinite Scroll) một cách mượt mà.

### 6. Kiến trúc Apollo Link mở rộng
- Cho phép can thiệp và tùy biến quy trình gửi/nhận request (Middleware).
- Dễ dàng cấu hình tự động đính kèm Token (Authentication) hoặc tự động gửi lại request khi mạng lỗi (Retry Link).

---

## 🤝 Sự kết hợp: Apollo Client + GraphQL + React Router

Khi kết hợp bộ ba này trong dự án React, chúng tạo nên một luồng xử lý dữ liệu tối ưu:

1. **React Router (`loader`)**: Đảm nhận việc chặn và kích hoạt gọi dữ liệu (Fetch) ngay trước khi trang kịp hiển thị (Render).
2. **Apollo Client (Cache)**: Kiểm tra xem dữ liệu đã có trong Cache chưa. Nếu có, trả về ngay lập tức để trang web hiển thị không độ trễ. Nếu chưa, gửi query GraphQL lên Server.
3. **GraphQL**: Đảm bảo chỉ lấy đúng các trường dữ liệu cần thiết, tối ưu băng thông mạng.

> 📌 **Tóm lại:** Apollo Client không chỉ là một công cụ gọi API (như Axios/Fetch), mà nó gánh vác toàn bộ phần xử lý logic dữ liệu phức tạp nhất ở Frontend, giúp lập trình viên tập trung 100% vào việc xây dựng giao diện.