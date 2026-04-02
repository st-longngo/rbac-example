# Testing Guide

## Chiến lược testing

| Loại | Công cụ | Mục tiêu |
|---|---|---|
| Unit Test | Vitest | `lib/rbac.ts`, `lib/definitions.ts` (Zod schemas) |
| Integration Test | Vitest + Prisma Test Environment | Server Actions, DAL với DB thực |
| E2E Test | Playwright | Luồng login, redirect, RBAC access |

---

## 1. Cài đặt

```bash
# Unit + Integration
pnpm add -D vitest @vitejs/plugin-react vite-tsconfig-paths

# E2E
pnpm add -D @playwright/test
pnpm exec playwright install
```

Thêm vào `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Config `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: 'node',
    globals: true,
  },
})
```

---

## 2. Unit Tests — RBAC Utilities

File `__tests__/lib/rbac.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { hasPermission, hasRole, hasAnyRole } from '@/lib/rbac'
import type { SessionPermission } from '@/lib/definitions'

describe('hasPermission', () => {
  const permissions: SessionPermission[] = [
    { action: 'READ', resource: 'REPORTS' },
    { action: 'MANAGE', resource: 'USERS' },
  ]

  it('trả về true khi user có đúng action + resource', () => {
    expect(hasPermission(permissions, 'READ', 'REPORTS')).toBe(true)
  })

  it('trả về true khi user có MANAGE (bao gồm tất cả actions)', () => {
    expect(hasPermission(permissions, 'DELETE', 'USERS')).toBe(true)
    expect(hasPermission(permissions, 'CREATE', 'USERS')).toBe(true)
    expect(hasPermission(permissions, 'UPDATE', 'USERS')).toBe(true)
  })

  it('trả về false khi user không có permission', () => {
    expect(hasPermission(permissions, 'CREATE', 'REPORTS')).toBe(false)
    expect(hasPermission(permissions, 'READ', 'ORDERS')).toBe(false)
  })

  it('trả về false với empty permissions', () => {
    expect(hasPermission([], 'READ', 'REPORTS')).toBe(false)
  })
})

describe('hasRole', () => {
  it('trả về true khi user có role', () => {
    expect(hasRole(['admin', 'manager'], 'admin')).toBe(true)
  })

  it('trả về false khi user không có role', () => {
    expect(hasRole(['user'], 'admin')).toBe(false)
  })
})

describe('hasAnyRole', () => {
  it('trả về true khi có ít nhất 1 role khớp', () => {
    expect(hasAnyRole(['manager'], ['admin', 'manager'])).toBe(true)
  })

  it('trả về false khi không có role nào khớp', () => {
    expect(hasAnyRole(['user'], ['admin', 'manager'])).toBe(false)
  })
})
```

---

## 3. Unit Tests — Zod Schemas

File `__tests__/lib/definitions.test.ts`:
```typescript
import { describe, it, expect } from 'vitest'
import { LoginFormSchema, RegisterFormSchema } from '@/lib/definitions'

describe('LoginFormSchema', () => {
  it('validate thành công với email và password hợp lệ', () => {
    const result = LoginFormSchema.safeParse({
      email: 'user@example.com',
      password: 'password123',
    })
    expect(result.success).toBe(true)
  })

  it('fail khi email không hợp lệ', () => {
    const result = LoginFormSchema.safeParse({
      email: 'not-an-email',
      password: 'password123',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.email).toBeDefined()
  })

  it('fail khi password dưới 8 ký tự', () => {
    const result = LoginFormSchema.safeParse({
      email: 'user@example.com',
      password: '1234567',
    })
    expect(result.success).toBe(false)
  })
})

describe('RegisterFormSchema', () => {
  it('validate thành công', () => {
    const result = RegisterFormSchema.safeParse({
      name: 'Nguyen Van A',
      email: 'user@example.com',
      password: 'Password123',
      confirmPassword: 'Password123',
    })
    expect(result.success).toBe(true)
  })

  it('fail khi confirmPassword không khớp', () => {
    const result = RegisterFormSchema.safeParse({
      name: 'Test User',
      email: 'user@example.com',
      password: 'Password123',
      confirmPassword: 'Different123',
    })
    expect(result.success).toBe(false)
    expect(result.error?.flatten().fieldErrors.confirmPassword).toBeDefined()
  })

  it('fail khi password không có chữ hoa', () => {
    const result = RegisterFormSchema.safeParse({
      name: 'Test User',
      email: 'user@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    })
    expect(result.success).toBe(false)
  })
})
```

---

## 4. E2E Tests — Authentication Flow

File `e2e/auth.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('redirect về /login khi chưa đăng nhập', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('login thành công với admin account', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'Admin@123456')
    await page.click('[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('login thất bại với sai mật khẩu', async ({ page }) => {
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'wrongpassword')
    await page.click('[type="submit"]')

    await expect(page.locator('[role="alert"]')).toBeVisible()
    await expect(page).toHaveURL('/login')
  })

  test('đăng ký tài khoản mới', async ({ page }) => {
    await page.goto('/register')
    await page.fill('[name="name"]', 'Test User')
    await page.fill('[name="email"]', `test_${Date.now()}@example.com`)
    await page.fill('[name="password"]', 'TestPass123')
    await page.fill('[name="confirmPassword"]', 'TestPass123')
    await page.click('[type="submit"]')

    await expect(page).toHaveURL('/dashboard')
  })

  test('logout thành công', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('[name="email"]', 'admin@example.com')
    await page.fill('[name="password"]', 'Admin@123456')
    await page.click('[type="submit"]')
    await expect(page).toHaveURL('/dashboard')

    // Logout
    await page.click('[data-testid="logout-button"]')
    await expect(page).toHaveURL('/login')

    // Không thể truy cập lại dashboard
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })
})
```

---

## 5. E2E Tests — RBAC Access Control

File `e2e/rbac.spec.ts`:
```typescript
import { test, expect } from '@playwright/test'

// Helper login
async function loginAs(page: any, email: string, password: string) {
  await page.goto('/login')
  await page.fill('[name="email"]', email)
  await page.fill('[name="password"]', password)
  await page.click('[type="submit"]')
  await page.waitForURL('/dashboard')
}

test.describe('RBAC — Admin access', () => {
  test.beforeEach(async ({ page }) => {
    await loginAs(page, 'admin@example.com', 'Admin@123456')
  })

  test('admin có thể truy cập /users', async ({ page }) => {
    await page.goto('/users')
    await expect(page).toHaveURL('/users')
    await expect(page.locator('h1')).toContainText('Quản lý người dùng')
  })

  test('admin có thể truy cập /roles', async ({ page }) => {
    await page.goto('/roles')
    await expect(page).toHaveURL('/roles')
  })
})

test.describe('RBAC — User access restrictions', () => {
  test.beforeEach(async ({ page }) => {
    // Cần tạo test user trước hoặc dùng seeded user
    await loginAs(page, 'user@example.com', 'UserPass123')
  })

  test('user bị chặn khi truy cập /users → 403', async ({ page }) => {
    await page.goto('/users')
    await expect(page.locator('h1')).toContainText('403')
  })

  test('user bị chặn khi truy cập /roles → 403', async ({ page }) => {
    await page.goto('/roles')
    await expect(page.locator('h1')).toContainText('403')
  })

  test('user có thể truy cập /dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/dashboard')
  })
})
```

---

## 6. Ma trận test cases

| User \ Route | `/dashboard` | `/reports` | `/orders` | `/users` | `/roles` |
|---|---|---|---|---|---|
| Unauthenticated | → `/login` | → `/login` | → `/login` | → `/login` | → `/login` |
| `guest` | ✅ 200 | ✅ 200 | ❌ 403 | ❌ 403 | ❌ 403 |
| `user` | ✅ 200 | ✅ 200 | ✅ 200 | ❌ 403 | ❌ 403 |
| `manager` | ✅ 200 | ✅ 200 | ✅ 200 | ⚠️ READ only | ❌ 403 |
| `admin` | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 | ✅ 200 |

---

## 7. Playwright Configuration

File `playwright.config.ts`:
```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
})
```
