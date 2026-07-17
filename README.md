pokedex-explorer/
├── app/							# Thư mục chứa toàn bộ mã nguồn ứng dụng
│   ├── graphql/					# 🌟 TẦNG QUẢN LÝ GRAPHQL (Unified Schema)
│   │   ├── schema.graphql			# File định nghĩa Schema thống nhất (SDL)
│   │   ├── queries.ts				# Tổng hợp các chuỗi GraphQL Queries (GET)
│   │   ├── mutations.ts			# Tổng hợp các chuỗi GraphQL Mutations (POST/PUT)
│   │   └── generated/				# Thư mục tự động sinh Types từ Schema (nếu có)
│   │
│   ├── services/					# ⚙️ TẦNG XỬ LÝ SERVER & DATALOADER
│   │   ├── api.ts					# Cấu hình gọi fetch lên GraphQL Endpoint
│   │   └── loaders/
│   │       └── pokemonLoader.ts	# Nơi định nghĩa các DataLoader (Gộp query N+1)
│   │
│   ├── routes/						# 🎨 TẦNG GIAO DIỆN & ĐIỀU HƯỚNG (React Router)
│   │   ├── +types/					# Các file type tự động sinh bởi React Router
│   │   ├── home.tsx				# Trang chủ (/): List Pokemon + Phân trang
│   │   ├── search.tsx				# Trang tìm kiếm (/search?q=...)
│   │   ├── detail.tsx				# Trang chi tiết (/pokemon/:id)
│   │   ├── type.tsx				# Trang duyệt theo hệ (/type/:name)
│   │   └── favorites.tsx			# Trang yêu thích (/favorites)
│   │
│   ├── components/					# Các UI Components tái sử dụng nhỏ lẻ
│   │   ├── PokemonCard.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── Navbar.tsx
│   │
│   ├── context/					# Cấu hình State toàn cục ở Client
│   │   └── apollo-client.ts		# ⚡ Cấu hình Apollo Client (Normalized Cache)
│   │
│   ├── app.css						# File cấu hình Tailwind CSS
│   ├── root.tsx					# File gốc bọc ApolloProvider & ErrorBoundary
│   └── routes.ts					# File cấu hình định tuyến của React Router v7
│
├── public/							# Chứa tài sản tĩnh (Images, Icons, Favicon)
├── package.json
├── tailwind.config.ts				# Cấu hình Tailwind
├── tsconfig.json					# Cấu hình TypeScript
└── vite.config.ts					# Cấu hình build dự án bằng Vite