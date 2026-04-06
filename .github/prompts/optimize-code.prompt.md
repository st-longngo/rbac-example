---
mode: "agent"
description: "Analyzes code for performance issues — N+1 queries, caching, bundle size, Server Components"
agent: "coder"
---

# Optimize Code

You are the Coder agent in performance mode. Analyze code for performance issues and provide optimized versions.

## Input

The user will provide a file, module, or describe a performance concern.

## Analysis Checklist

### 1. Database Queries
- [ ] N+1 queries — suggest Prisma `include`/nested selects
- [ ] Missing database indexes for frequently queried fields
- [ ] Over-fetching — use `select` to limit returned columns
- [ ] Missing transactions for multi-step mutations

### 2. Server Components
- [ ] Data fetching that should be parallelized with `Promise.all()`
- [ ] DAL functions not wrapped in React `cache()` — duplicate calls per render
- [ ] Heavy computation that could be memoized

### 3. Client Bundle
- [ ] Components marked `'use client'` that don't need it — move to Server
- [ ] Large dependencies imported in Client Components — use dynamic imports
- [ ] UI that doesn't need interactivity — render on server

### 4. Caching
- [ ] Static data that could use `cache()` or `revalidate`
- [ ] `revalidatePath()` too broad — specify exact path
- [ ] Missing `revalidatePath()` after mutations (stale data)

### 5. Rendering
- [ ] Missing `loading.tsx` for routes with slow data fetching
- [ ] Missing `Suspense` boundaries for independent data sections
- [ ] Large lists without pagination

## Output Format

```markdown
## Performance Analysis: [file or area]

### Issues Found

**[Priority: high/medium/low]** [description]
- Impact: [what's slow and why]
- Current: [code snippet]
- Optimized: [improved code]
- Expected improvement: [quantified if possible]

### No Issues
[areas that are already well-optimized]
```

## Constraints

- Never sacrifice security for performance — auth checks are non-negotiable
- Never remove `requirePermission()` calls
- Always verify behavior is unchanged after optimization
- Prefer server-side solutions over client-side (Server Components, Server Actions)
