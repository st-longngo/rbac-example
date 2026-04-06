---
applyTo: "**/api/**"
description: "API Route handler conventions — Auth.js handler, response format, validation"
---

# API Design Conventions

## Primary Rule

- This project uses **Server Actions** for all mutations — not API routes
- The only API route is `app/api/auth/[...nextauth]/route.ts` for Auth.js
- Do NOT create new API routes unless there is a specific need (webhooks, external integrations)

## Auth.js Route Handler

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/lib/auth'
export const { GET, POST } = handlers
```

## If You Must Create an API Route

- Place in `app/api/<resource>/route.ts`
- Export named HTTP methods: `GET`, `POST`, `PUT`, `DELETE`
- Always validate input with Zod
- Always call `verifySession()` first for protected endpoints
- Use standard response envelope:

```ts
// Success
return Response.json({ data: result, meta: { total: 100 } })

// Error
return Response.json({ error: 'Not found' }, { status: 404 })
```

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Success |
| 201 | Created |
| 400 | Validation error |
| 401 | Unauthenticated |
| 403 | Forbidden / insufficient permissions |
| 404 | Resource not found |
| 500 | Internal server error |

## Never Do

- Never call API routes from Server Components — extract shared logic to `lib/`
- Never expose internal IDs or stack traces in error responses
- Never access DB directly in route handlers — go through DAL or service functions
