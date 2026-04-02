# Project Structure

## Cấu trúc thư mục đầy đủ

```
rbac-module/
│
├── app/                              # Next.js App Router
│   │
│   ├── (auth)/                       # Route group: public auth pages
│   │   ├── login/
│   │   │   └── page.tsx              # Trang đăng nhập
│   │   └── register/
│   │       └── page.tsx              # Trang đăng ký
│   │
│   ├── (protected)/                  # Route group: yêu cầu đăng nhập
│   │   ├── layout.tsx                # Layout kiểm tra session chung
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Dashboard chính
│   │   │
│   │   ├── (admin)/                  # Route group: chỉ role admin
│   │   │   ├── users/
│   │   │   │   └── page.tsx          # Quản lý người dùng
│   │   │   └── roles/
│   │   │       └── page.tsx          # Quản lý roles & permissions
│   │   │
│   │   └── (manager)/                # Route group: admin + manager
│   │       ├── reports/
│   │       │   └── page.tsx          # Quản lý reports
│   │       └── orders/
│   │           └── page.tsx          # Quản lý orders
│   │
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # Auth.js API handler
│   │
│   ├── unauthorized.tsx              # 401 page (unauthenticated)
│   ├── forbidden.tsx                 # 403 page (unauthorized)
│   ├── layout.tsx                    # Root layout
│   ├── page.tsx                      # Landing page
│   └── globals.css
│
├── lib/                              # Shared server-side utilities
│   ├── auth.ts                       # Auth.js config (providers, callbacks, adapter)
│   ├── dal.ts                        # Data Access Layer (server-only)
│   ├── definitions.ts                # Zod schemas + TypeScript types
│   ├── rbac.ts                       # Permission checker utilities
│   └── prisma.ts                     # Prisma client singleton
│
├── actions/                          # Server Actions
│   ├── auth.ts                       # loginAction, registerAction, logoutAction
│   └── admin.ts                      # assignRole, createPermission, ...
│
├── components/
│   ├── ui/                           # shadcn/ui components (auto-generated)
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── badge.tsx
│   │   ├── table.tsx
│   │   ├── dialog.tsx
│   │   └── alert.tsx
│   │
│   ├── auth/
│   │   ├── LoginForm.tsx             # Client Component: form login
│   │   └── RegisterForm.tsx          # Client Component: form register
│   │
│   └── rbac/
│       ├── PermissionGate.tsx        # Wrapper ẩn/hiện UI theo permission
│       └── RoleBadge.tsx             # Hiển thị role badge
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Seed roles, permissions, admin user
│
├── proxy.ts                          # Route guard (thay middleware.ts - Next.js 16)
├── next.config.ts                    # Next.js config (authInterrupts: true)
├── .env.example                      # Template biến môi trường
├── .env.local                        # Biến thực tế (không commit)
├── tsconfig.json
├── package.json
└── docs/                             # Tài liệu dự án
    ├── 01-overview.md
    ├── 02-rbac-model.md
    ├── 03-project-structure.md       # ← file này
    ├── 04-database-schema.md
    ├── 05-auth-setup.md
    ├── 06-dal-and-rbac.md
    ├── 07-server-actions.md
    ├── 08-ui-guide.md
    ├── 09-setup-guide.md
    ├── 10-conventions.md
    └── 11-testing.md
```

---

## Giải thích các thư mục quan trọng

### `app/(auth)/` — Public Routes
Route group không ảnh hưởng URL. Các trang trong đây **không** yêu cầu session.
- URL: `/login`, `/register`
- Nếu đã đăng nhập → `proxy.ts` redirect về `/dashboard`

### `app/(protected)/` — Protected Routes
Có `layout.tsx` riêng gọi `verifySession()` để đảm bảo mọi trang con đều được bảo vệ.
- URL: `/dashboard`, `/users`, `/roles`, `/reports`, `/orders`
- Chưa đăng nhập → `unauthorized()` → redirect `/login`

### `app/(protected)/(admin)/` — Admin-Only Routes
Các trang trong đây kiểm tra `MANAGE` permission trên resource tương ứng.
- URL: `/users`, `/roles`
- Không đủ quyền → `forbidden()` → HTTP 403

### `lib/` — Server-Only Utilities
**Toàn bộ** các file trong `lib/` đều dùng `import 'server-only'` (trừ `definitions.ts` dùng được cả 2 phía).

### `proxy.ts` — Route Guard
File này thay thế `middleware.ts` (deprecated trong Next.js 16). Export function phải tên là `proxy` (không phải `middleware`).

### `components/rbac/PermissionGate.tsx`
Client Component cho phép ẩn/hiện UI element theo permission:
```tsx
<PermissionGate action="DELETE" resource="USERS">
  <DeleteUserButton />
</PermissionGate>
```
Cần truyền permissions từ Server Component xuống qua props hoặc Context.

---

## Naming Conventions

| Loại file | Convention | Ví dụ |
|---|---|---|
| Server Component | PascalCase | `UserListPage.tsx` |
| Client Component | PascalCase + `'use client'` | `LoginForm.tsx` |
| Server Action | camelCase + `'use server'` | `loginAction.ts` |
| Utility / helper | camelCase | `rbac.ts`, `dal.ts` |
| Zod schema | PascalCase + `Schema` suffix | `LoginFormSchema` |
| TypeScript type | PascalCase | `SessionPayload`, `UserRole` |
| Prisma model | PascalCase (singular) | `User`, `Role`, `Permission` |
