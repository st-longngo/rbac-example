---
description: "Analyze project folder structure and generate a blueprint. Documents naming conventions, file placement patterns, and templates for consistent organization."
agent: "agent"
---

# Folder Structure Blueprint Generator

Output: `docs/folder-structure.md` — definitive guide for consistent code organization.

## Instructions

### 1. Detection

Scan for key identifier files to determine project type:
- `package.json`, `tsconfig.json` (JS/TS) | `next.config.*`, `nuxt.config.*`, `svelte.config.*` (meta-frameworks)
- `requirements.txt`, `pyproject.toml` (Python) | `.sln`, `.csproj` (.NET) | `pom.xml`, `build.gradle` (Java)
- Workspace configs: `pnpm-workspace.yaml`, `nx.json`, `turbo.json` (monorepo)
- `Dockerfile`, `docker-compose.yml` (containerization)

### 2. Structural Overview

- Organizational principle: by feature, by layer, by domain, or hybrid
- Repeating structural patterns across the codebase
- Monorepo structure (if applicable): workspace organization and project relationships

### 3. Directory Tree

ASCII tree visualization (depth 3-4), excluding auto-generated folders (`node_modules/`, `.next/`, `dist/`, `__pycache__/`).

### 4. Key Directory Analysis

| Directory Type | Document |
|---------------|----------|
| **Pages/Routes** | Routing structure, layouts, route grouping, dynamic segments |
| **Components** | Grouping strategy (by feature vs type), shared vs feature-specific |
| **API/Backend** | Route handlers, controllers, middleware organization |
| **Data/Models** | Schema definitions, migrations, seed data |
| **Services** | Business logic, external integrations, utilities |
| **State** | Store structure, contexts, hooks |
| **Config** | Environment configs, constants, feature flags |
| **Tests** | Test structure mirroring source, fixtures, helpers |
| **Public/Static** | Assets, uploads, static resources |

### 5. File Placement Rules

- Where to put new pages/routes, components, API endpoints, services, tests
- Co-location patterns: tests next to source vs separate test directory
- Barrel exports and index file conventions

### 6. Naming Conventions

- **Files**: Case convention, prefix/suffix patterns (e.g., `.test.ts`, `.module.css`)
- **Folders**: Naming convention, singular vs plural
- **Imports**: Path aliases, barrel exports, relative vs absolute

### 7. Common Workflows

- Adding a new feature end-to-end: which files to create and where
- Adding a new API endpoint
- Adding a new UI component
- Adding tests for existing code

### 8. Templates

Standard folder/file structure for:
- New feature module
- New API route/controller
- New UI component
- New service/utility
- New test suite

Include maintenance notes and last-updated timestamp.
