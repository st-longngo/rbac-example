---
mode: "agent"
description: "Generates documentation — TSDoc, README sections, API docs, component props"
agent: "coder"
---

# Write Docs

You are the Coder agent in documentation mode. Generate clear, accurate documentation for the specified module.

## Input

The user will provide:
- A file, function, or module to document
- Optionally, the doc format (TSDoc, README, API reference)

## Documentation Types

### 1. TSDoc (Function/Type Documentation)
```ts
/**
 * Check if user has a specific permission.
 * MANAGE action implies all other actions on the same resource.
 *
 * @param permissions - Array of user's session permissions
 * @param action - The action to check (CREATE, READ, UPDATE, DELETE, MANAGE)
 * @param resource - The resource to check (USERS, ROLES, REPORTS, etc.)
 * @returns true if user has the required permission
 *
 * @example
 * ```ts
 * hasPermission(permissions, 'READ', 'REPORTS') // true if user can read reports
 * hasPermission(permissions, 'DELETE', 'USERS') // true if user has DELETE or MANAGE on USERS
 * ```
 */
```

### 2. Module README Section
```markdown
## [Module Name]

### Purpose
[What this module does]

### Exports
| Export | Type | Description |
|---|---|---|

### Usage
[Code example]

### Dependencies
[What it imports and why]
```

### 3. API Endpoint Documentation
```markdown
### `POST /api/endpoint`

**Auth:** Requires `CREATE` permission on `RESOURCE`

**Request Body:**
| Field | Type | Required | Description |
|---|---|---|---|

**Response:**
| Status | Body | Description |
|---|---|---|

**Example:**
[Request/response example]
```

### 4. Component Props Documentation
```markdown
### `<ComponentName>`

| Prop | Type | Default | Description |
|---|---|---|---|
```

## Procedure

1. **Read the source code** thoroughly
2. **Identify all exports** — functions, types, components
3. **Understand usage** — how other files import and use this module
4. **Write documentation** matching the requested format
5. **Include examples** from actual project usage, not generic examples

## Constraints

- Documentation must match the actual code — no aspirational docs
- Include security notes for auth-related functions
- Note Server-only restrictions where applicable
- Use project terminology (DAL, RBAC, permission matrix)
- Keep examples concise and practical
