# Setup Guide

## Yêu cầu môi trường

| Tool | Phiên bản tối thiểu |
|---|---|
| Node.js | 20.x trở lên |
| pnpm | 9.x trở lên |
| PostgreSQL | 14.x trở lên |

---

## Bước 1 — Clone & Cài dependencies

```bash
git clone <repo-url>
cd rbac-module

pnpm install
```

---

## Bước 2 — Cấu hình biến môi trường

```bash
cp .env.example .env.local
```

Chỉnh sửa `.env.local`:

```bash
# PostgreSQL connection string
# Định dạng: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
DATABASE_URL="postgresql://postgres:password@localhost:5432/rbac_db"

# Auth.js secret — tạo ngẫu nhiên bằng lệnh:
# openssl rand -base64 32
AUTH_SECRET="paste-your-generated-secret-here"

# URL ứng dụng
AUTH_URL="http://localhost:3000"
```

> **Tạo AUTH_SECRET:**
> ```bash
> openssl rand -base64 32
> ```

---

## Bước 3 — Tạo database

Đảm bảo PostgreSQL đang chạy, sau đó tạo database:

```bash
# Với psql
psql -U postgres -c "CREATE DATABASE rbac_db;"

# Hoặc dùng Docker
docker run --name rbac-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=rbac_db \
  -p 5432:5432 \
  -d postgres:14
```

---

## Bước 4 — Cài các packages cần thiết

```bash
# Auth & ORM
pnpm add next-auth@beta @auth/prisma-adapter @prisma/client bcryptjs zod server-only

# Dev dependencies
pnpm add -D prisma @types/bcryptjs ts-node

# UI Components
pnpm dlx shadcn@latest init
pnpm dlx shadcn@latest add button input label card alert badge table dialog \
  dropdown-menu avatar separator
```

---

## Bước 5 — Khởi tạo Prisma

```bash
# Khởi tạo Prisma (nếu chưa có schema.prisma)
pnpm prisma init

# Chạy migration để tạo tables
pnpm prisma migrate dev --name init

# Kiểm tra schema đã được apply
pnpm prisma studio
```

---

## Bước 6 — Chạy Seed

```bash
# Chạy seed để tạo dữ liệu ban đầu
pnpm prisma db seed
```

Seed sẽ tạo:
- **Permissions** — toàn bộ ma trận action × resource
- **Roles** — admin, manager, user, guest
- **Phân quyền mặc định** cho từng role
- **Admin account**: `admin@example.com` / `Admin@123456`

---

## Bước 7 — Khởi động server

```bash
pnpm dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

---

## Kiểm tra hoạt động

### Test cases cơ bản:

| Scenario | Expected |
|---|---|
| Truy cập `/dashboard` khi chưa login | Redirect về `/login` |
| Login với `admin@example.com` | Redirect về `/dashboard` |
| Login với tài khoản `user` → truy cập `/users` | HTTP 403 - Forbidden |
| Login với `admin` → truy cập `/users` | Hiển thị danh sách users |
| Đăng xuất | Redirect về `/login`, không thể back |

---

## Scripts hữu ích

```bash
# Development
pnpm dev                          # Khởi động dev server

# Database
pnpm prisma migrate dev           # Tạo migration mới
pnpm prisma migrate reset         # Reset DB + re-seed
pnpm prisma db seed               # Chạy seed
pnpm prisma studio                # Mở Prisma Studio (GUI)
pnpm prisma generate              # Regenerate Prisma Client

# Build
pnpm build                        # Build production
pnpm start                        # Chạy production build
```

---

## Cấu hình `package.json`

Sau khi setup, `package.json` cần có thêm:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:reset": "prisma migrate reset",
    "db:seed": "prisma db seed",
    "db:studio": "prisma studio"
  },
  "prisma": {
    "seed": "ts-node --compiler-options {\"module\":\"CommonJS\"} prisma/seed.ts"
  }
}
```

---

## Troubleshooting

### Lỗi: `Cannot find module '@prisma/client'`
```bash
pnpm prisma generate
```

### Lỗi: `Error: Missing AUTH_SECRET`
Đảm bảo `.env.local` tồn tại và `AUTH_SECRET` đã được set.

### Lỗi: Migration drift detected
```bash
pnpm prisma migrate reset
```

### Lỗi: `proxy.ts` không hoạt động
- Kiểm tra tên export: phải là `proxy` (không phải `middleware`)
- Kiểm tra `config.matcher` không block API routes

### Session không được tạo sau khi login
- Kiểm tra `DATABASE_URL` kết nối đúng
- Kiểm tra `AUTH_SECRET` đã được set
- Chạy `pnpm prisma studio` để xem bảng `Session` có data không
