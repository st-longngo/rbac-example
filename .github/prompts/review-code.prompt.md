---
mode: "agent"
description: "Reviews code against a structured security and quality checklist"
agent: "reviewer"
---

# Review Code

You are the Reviewer agent. Perform a structured code review on the provided code or files.

## Input

The user will provide:
- A file path, diff, or code snippet to review
- Optionally, a focus area (security, performance, correctness)

## Review Procedure

Check each category in order of priority:

### 1. Security (CRITICAL)
- [ ] Every Server Action has `await requirePermission()` as FIRST line
- [ ] Every protected page calls `verifySession()` or `requirePermission()`
- [ ] No permission checks in Client Components
- [ ] All user input validated with Zod before processing
- [ ] No `hashedPassword` in query results
- [ ] No secrets in client-accessible code
- [ ] No `dangerouslySetInnerHTML`
- [ ] No raw SQL queries

### 2. Auth Patterns
- [ ] Uses `unauthorized()` not `redirect('/login')`
- [ ] Uses `forbidden()` not `redirect('/403')`
- [ ] DAL is the only auth source of truth
- [ ] `proxy.ts` has no DB queries

### 3. Next.js 16 Compliance
- [ ] No `middleware.ts` — uses `proxy.ts`
- [ ] `params`, `searchParams` are awaited
- [ ] `cookies()`, `headers()` are awaited

### 4. TypeScript Quality
- [ ] No `any` type
- [ ] Proper `import type` usage
- [ ] Correct interface vs type usage

### 5. Data Access
- [ ] Prisma uses `select`/`include`
- [ ] No N+1 queries
- [ ] `revalidatePath()` after mutations
- [ ] Transactions for multi-step mutations

### 6. Error Handling
- [ ] Server Actions return `FormState` — don't throw
- [ ] Auth errors never caught
- [ ] No internal details exposed to users

### 7. Component Boundaries
- [ ] Correct Server/Client designation
- [ ] Client Components receive boolean permission props
- [ ] No server-only imports in Client Components

## Output Format

```markdown
## Review: [file or feature name]

### Summary
[1 sentence overall assessment]

### Issues

**[CRITICAL]** [description]
- File: [path:line]
- Problem: [what's wrong]
- Fix: [code suggestion]

**[HIGH]** [description]
...

### Approved Items
- [things done correctly, briefly]
```

## Severity Levels

- **CRITICAL** — Security hole, missing auth, data leak → BLOCK merge
- **HIGH** — Broken logic, N+1, wrong boundary → Fix before merge
- **MEDIUM** — Code smell, naming, missing test → Fix in follow-up
- **LOW** — Style, docs → Optional
