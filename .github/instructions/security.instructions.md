---
applyTo: "**/proxy.ts,**/lib/auth.ts,**/lib/dal.ts,**/actions/**,**/api/**"
description: "Security conventions — auth checks, input validation, OWASP awareness, secrets"
---

# Security Conventions

## Auth — Single Source of Truth

- All auth/authz checks go through `lib/dal.ts` — never check cookies or session directly
- `proxy.ts` is optimistic only — never query DB, never check permissions
- Server Actions: `await requirePermission(action, resource)` as FIRST line
- Client Components: NEVER check permissions — receive boolean props from Server Components

## Input Validation

- Validate ALL user input with Zod schemas before processing
- Server Actions: `Schema.safeParse(formData)` — return field errors, don't throw
- Never trust client-side validation — always re-validate on server

## Password Security

- Hash with `bcryptjs` at cost factor 12: `bcrypt.hash(password, 12)`
- Never store plaintext passwords
- Never log passwords or hashed passwords
- Never return `hashedPassword` from any query

## Session Security

- Session strategy: `database` (stored in PostgreSQL, supports revocation)
- Session cookie: `httpOnly`, `secure`, `sameSite`
- Session maxAge: 30 days
- Force new session on login (prevent session fixation)

## Environment Variables

- `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` are server-only — never prefix with `NEXT_PUBLIC_`
- Never hardcode secrets in source code
- Use `.env.local` for local development (never committed)

## OWASP Awareness

- **Broken Access Control:** Deny by default, check permissions at every layer
- **Injection:** Use Prisma parameterized queries — never build SQL strings
- **XSS:** React escapes by default — never use `dangerouslySetInnerHTML`
- **CSRF:** Server Actions include CSRF token automatically
- **Sensitive Data Exposure:** Never return full user objects — use `select` in Prisma

## Never Do

- Never expose internal error details to users
- Never log user credentials or session tokens
- Never check `role === 'admin'` in client code — use server-side permission checks
- Never commit `.env.local` or any file with secrets
