# Project Overview: RBAC Login Module

## Mục tiêu

Xây dựng một hệ thống xác thực (authentication) và phân quyền (authorization) theo mô hình **Role-Based Access Control (RBAC)** kết hợp **ABAC-lite** (Attribute-Based Access Control), cho phép:

- Người dùng đăng nhập / đăng ký qua Email + Password
- Phân quyền truy cập trang và tính năng theo Role → Permission → Resource
- Hiển thị UI linh hoạt dựa trên quyền hạn của từng người dùng
- Quản lý Roles và Permissions từ giao diện Admin

---

## Tech Stack

| Layer | Công nghệ | Lý do chọn |
|---|---|---|
| Framework | Next.js 16.2.2 (App Router) | Hỗ trợ Server Components, Server Actions, `proxy.ts`, `unauthorized()` / `forbidden()` |
| Language | TypeScript 5 | Type safety cho toàn bộ codebase |
| Auth | Auth.js v5 (NextAuth beta) | Production-ready, Prisma Adapter, Credentials provider |
| ORM | Prisma | DX tốt, Prisma Studio, type-safe queries, adapter chính thức cho Auth.js |
| Database | PostgreSQL | Relational schema cho RBAC many-to-many |
| Validation | Zod | Schema validation cho form và Server Actions |
| UI | shadcn/ui + Tailwind CSS v4 | Component đẹp, accessible, copy-paste, không lock-in |
| Password | bcryptjs | Hashing password an toàn |

---

## Architecture Overview

```
Browser
  │
  ├─ HTTP Request
  ▼
proxy.ts ──────── Optimistic check (đọc session cookie, không query DB)
  │                   → 401 redirect nếu không có session
  │                   → tiếp tục nếu có session (chưa verify permissions)
  ▼
App Router (Server Component / Route Handler)
  │
  ├─ verifySession() ─── lib/dal.ts ─── React cache()
  │       │                               └─ Auth.js auth() → session
  │       │                               └─ DB query lấy roles + permissions
  │       ▼
  │   unauthorized()   ← nếu chưa đăng nhập  → app/unauthorized.tsx (HTTP 401)
  │   forbidden()      ← nếu thiếu quyền     → app/forbidden.tsx    (HTTP 403)
  │
  ▼
Page / Component render
  │
  ├─ hasPermission(action, resource) → conditional UI rendering
  ▼
Response to Browser
```

---

## Luồng Authentication

```
1. User nhập email + password tại /login
2. loginAction() (Server Action) → Zod validate
3. signIn('credentials', ...) từ Auth.js
4. Auth.js Credentials provider → bcrypt.compare(password, hashedPassword)
5. Tạo database session → lưu sessionToken vào cookie (httpOnly, secure)
6. Session callback → nhúng userId + roles + permissions vào session object
7. Redirect đến /dashboard
```

---

## Luồng Authorization

```
1. User truy cập route (vd: /admin/users)
2. proxy.ts đọc session cookie → nếu không có → redirect /login
3. Server Component gọi verifySession() từ DAL
4. verifySession() lấy session từ Auth.js → query DB lấy permissions
5. checkPermission('READ', 'USERS') → false → forbidden() → HTTP 403
6. Nếu đủ quyền → render page
```

---

## Các Role Mặc Định

| Role | Mô tả |
|---|---|
| `admin` | Toàn quyền hệ thống |
| `manager` | Quản lý reports, orders |
| `user` | Truy cập tính năng cơ bản |
| `guest` | Chỉ xem một số trang public |

---

## Key Design Decisions

1. **Session strategy: `database`** — Session lưu vào DB, hỗ trợ force logout và revocation khi thay đổi permissions runtime.
2. **proxy.ts thay middleware.ts** — Next.js 16 deprecate `middleware`, đổi thành `proxy` convention. Auth check trong proxy chỉ là optimistic (không query DB).
3. **DAL pattern** — Mọi logic auth/authz tập trung tại `lib/dal.ts`, wrap bằng React `cache()` để tránh duplicate DB calls.
4. **`unauthorized()` / `forbidden()`** — Dùng hàm từ `next/navigation` thay vì tự redirect, kích hoạt `authInterrupts: true` trong `next.config.ts`.
5. **many-to-many Role↔Permission** — Cho phép assign nhiều roles cho một user, và tái sử dụng permissions giữa các roles.
