# RBAC Data Model

## Mô hình tổng quan

Hệ thống áp dụng **RBAC với ABAC-lite**, gồm 3 tầng:

```
User ──(has many)──► Role ──(has many)──► Permission
                                              │
                                         action + resource
```

- **User** có thể có nhiều **Roles**
- **Role** có thể có nhiều **Permissions**
- **Permission** = `action` thực hiện trên `resource`

---

## Các Entities

### User
Đại diện cho người dùng trong hệ thống.

| Field | Type | Mô tả |
|---|---|---|
| id | String (cuid) | Primary key |
| email | String (unique) | Email đăng nhập |
| hashedPassword | String? | Null nếu dùng OAuth |
| name | String? | Tên hiển thị |
| createdAt | DateTime | Thời điểm tạo |
| updatedAt | DateTime | Thời điểm cập nhật |

### Role
Nhóm quyền hạn có thể gán cho user.

| Field | Type | Mô tả |
|---|---|---|
| id | String (cuid) | Primary key |
| name | String (unique) | Tên role (admin, manager, user, guest) |
| description | String? | Mô tả role |
| createdAt | DateTime | Thời điểm tạo |

**Roles mặc định:**
- `admin` — Toàn quyền hệ thống, bao gồm quản lý roles
- `manager` — Quản lý reports và orders
- `user` — Truy cập dashboard và tính năng cơ bản
- `guest` — Chỉ đọc một số resource giới hạn

### Permission
Quyền thực hiện một `action` cụ thể trên một `resource`.

| Field | Type | Mô tả |
|---|---|---|
| id | String (cuid) | Primary key |
| action | Enum `Action` | Hành động được phép |
| resource | Enum `Resource` | Tài nguyên được tác động |

**Constraint:** `(action, resource)` là unique.

---

## Enums

### Action
```prisma
enum Action {
  CREATE
  READ
  UPDATE
  DELETE
  MANAGE   // Bao gồm tất cả actions trên
}
```

### Resource
```prisma
enum Resource {
  USERS
  ROLES
  REPORTS
  ORDERS
  SETTINGS
  DASHBOARD
}
```

---

## Ma trận phân quyền mặc định

| Role     | USERS              | ROLES              | REPORTS            | ORDERS             | SETTINGS           | DASHBOARD |
|----------|--------------------|--------------------|--------------------|--------------------|--------------------|-----------|
| admin    | MANAGE             | MANAGE             | MANAGE             | MANAGE             | MANAGE             | READ      |
| manager  | READ               | —                  | CREATE, READ, UPDATE | CREATE, READ, UPDATE | —              | READ      |
| user     | READ (own profile) | —                  | READ               | READ, CREATE       | —                  | READ      |
| guest    | —                  | —                  | READ               | —                  | —                  | READ      |

> **Lưu ý:** `MANAGE` = tất cả (CREATE + READ + UPDATE + DELETE). Khi kiểm tra permission, nếu user có `MANAGE` trên một resource thì được coi là có tất cả các actions còn lại trên resource đó.

---

## Quan hệ giữa các entities

```
User (1) ──────────── (*) UserRole (*) ──────────── (1) Role
                                                          │
                                                          │ (1)
                                                          │
                                                     (*) RolePermission (*) ──── (1) Permission
                                                                                       │
                                                                               action + resource
```

### Join Tables

**UserRole** (User ↔ Role):
| Field | Type | Mô tả |
|---|---|---|
| userId | String | FK → User.id |
| roleId | String | FK → Role.id |
| assignedAt | DateTime | Thời điểm assign |
| assignedBy | String? | userId của admin |

**RolePermission** (Role ↔ Permission):
| Field | Type | Mô tả |
|---|---|---|
| roleId | String | FK → Role.id |
| permissionId | String | FK → Permission.id |

---

## Logic kiểm tra quyền

```typescript
// Pseudo-code
function hasPermission(
  userPermissions: Permission[],
  requiredAction: Action,
  requiredResource: Resource
): boolean {
  return userPermissions.some(p =>
    p.resource === requiredResource &&
    (p.action === requiredAction || p.action === 'MANAGE')
  )
}
```

**Ví dụ:**
- User có `{ action: 'MANAGE', resource: 'REPORTS' }` → được phép `READ`, `CREATE`, `UPDATE`, `DELETE` trên `REPORTS`
- User có `{ action: 'READ', resource: 'REPORTS' }` → **không** được phép `CREATE` trên `REPORTS`

---

## Lấy tất cả permissions của một user

```sql
SELECT DISTINCT p.action, p.resource
FROM "User" u
JOIN "UserRole" ur ON ur."userId" = u.id
JOIN "Role" r ON r.id = ur."roleId"
JOIN "RolePermission" rp ON rp."roleId" = r.id
JOIN "Permission" p ON p.id = rp."permissionId"
WHERE u.id = $userId
```

Trong Prisma:
```typescript
const userWithPermissions = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    userRoles: {
      include: {
        role: {
          include: {
            rolePermissions: {
              include: { permission: true },
            },
          },
        },
      },
    },
  },
})
```
