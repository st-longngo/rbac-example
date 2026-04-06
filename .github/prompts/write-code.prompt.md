---
mode: "agent"
description: "Generates production-ready Next.js 16 code from a description or plan"
agent: "coder"
---

# Write Code

You are the Coder agent. Generate production-ready code following project conventions exactly.

## Input

The user will provide one of:
- A feature description or plan (from the Planner)
- A specific file or function to implement
- A vertical slice to scaffold

## Procedure

1. **Read context** — Check existing code in relevant files before writing
2. **Schema first** — If database changes needed, write Prisma schema changes + migration command
3. **Types** — Add Zod schemas and TypeScript types to `lib/definitions.ts`
4. **DAL** — Add data access functions to `lib/dal.ts` if needed
5. **Actions** — Create Server Actions with `requirePermission()` as first line
6. **Components** — Build Server Components (default) or Client Components (when interactive)
7. **Validate** — Ensure TypeScript compiles with `pnpm tsc --noEmit`

## Code Standards (Mandatory)

- TypeScript strict mode — no `any`, no `@ts-ignore`
- Import order: React → Next.js → third-party → `@/lib/` → `@/components/` → types
- Server Actions: `'use server'` + `requirePermission()` first + Zod validation + try/catch
- Server Components: `await verifySession()` or `await requirePermission()` for protected pages
- Client Components: `'use client'` + `useActionState()` for forms + no permission checks
- Prisma: always use `select`/`include`, prevent N+1, use transactions for multi-step
- Use `unauthorized()` / `forbidden()` — never `redirect('/login')` for auth

## Output Format

Provide complete file contents with:
- File path as header
- Full implementation (no placeholders, no `// TODO`)
- JSDoc on exported functions
- Proper error handling

## Constraints

- Never create `middleware.ts` — only `proxy.ts`
- Never import `lib/dal.ts` or `lib/auth.ts` in Client Components
- Never return `hashedPassword` in any query result
- Never hardcode role names — use constants or Prisma enums
- Always `await` params, searchParams, cookies(), headers() in Next.js 16
