---
applyTo: "**/.github/**"
description: "Git and PR conventions — conventional commits, branching, PR checklist"
---

# Git Conventions

## Commit Messages (Conventional Commits)

```
<type>(<scope>): <short description>

[optional body]
```

| Type | Use for |
|---|---|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `chore` | Build, deps, config changes |
| `docs` | Documentation only |
| `test` | Adding or updating tests |
| `style` | Formatting, whitespace (no logic change) |

Examples:
- `feat(auth): add login action with Zod validation`
- `fix(rbac): MANAGE action should imply DELETE`
- `chore(prisma): update schema for user roles`

## Branch Naming

- `feature/<short-description>` — new features
- `bugfix/<short-description>` — bug fixes
- `hotfix/<short-description>` — urgent production fixes

## PR Requirements

- Title matches conventional commit format
- Squash merge preferred
- PR description includes:
  - **What:** Brief description of the change
  - **Why:** Business or technical reason
  - **Testing:** How it was tested

## Pre-Merge Checklist

- [ ] All protected pages/actions have auth checks
- [ ] No hardcoded role names
- [ ] Server Actions validate input with Zod
- [ ] No sensitive data returned from Server Actions
- [ ] `revalidatePath()` called after mutations
- [ ] No `console.log` with user data
- [ ] No `any` type in auth-related code
- [ ] TypeScript compiles: `pnpm tsc --noEmit`
