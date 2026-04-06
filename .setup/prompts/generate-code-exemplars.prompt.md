---
description: "Scan codebase to identify high-quality code exemplars. Documents real patterns to establish standards and maintain consistency."
agent: "agent"
---

# Code Exemplars Blueprint Generator

Output: `docs/exemplars.md` — catalog of exemplary code patterns from the actual codebase.

## Instructions

Scan the codebase and identify high-quality, representative code that demonstrates best practices.

### 1. Detection

- Auto-detect languages and frameworks from file extensions and configs
- Identify well-structured files with clear naming, proper error handling, and good separation of concerns
- **Only reference actual files** — no hypothetical examples

### 2. Exemplar Criteria

- Readable, well-named, well-structured code
- Proper error handling and input validation
- Clean separation of concerns and single responsibility
- Idiomatic usage of the framework/language
- Good test coverage patterns

### 3. Categories

Identify up to 3 exemplars per category:

| Category | Look For |
|----------|----------|
| **Pages/Routes** | Route handlers, page components, layouts, loading/error states |
| **UI Components** | Reusable components, props interfaces, composition patterns |
| **API Endpoints** | Request handling, validation, response formatting, error handling |
| **Data Access** | ORM/query patterns, repository implementations, migrations |
| **Services** | Business logic, external integrations, cross-cutting concerns |
| **Auth** | Authentication flows, authorization guards, session management |
| **Forms** | Validation, submission handling, error display |
| **State Management** | Store/context patterns, data fetching, caching |
| **Tests** | Unit tests, integration tests, E2E tests, test utilities |
| **Config** | Environment config, feature flags, middleware setup |

### 4. Per Exemplar

Document:
- File path (relative to repo root)
- Why it's exemplary (1-2 sentences)
- Pattern/component type
- Key principles demonstrated
- Representative code snippet (the most instructive section)

### 5. Codebase Observations

- Consistent patterns observed across files
- Naming and structural conventions
- Anti-patterns or inconsistencies to avoid

### 6. Output Structure

1. Brief introduction explaining purpose
2. Table of contents by category
3. Exemplars organized by category
4. Summary of quality patterns to maintain

**Important**: Only include actual files. Verify all paths exist.
