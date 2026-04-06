---
description: "Analyze codebase and generate architecture blueprint. Documents patterns, layers, data architecture, cross-cutting concerns, and development blueprints."
agent: "agent"
---

# Project Architecture Blueprint Generator

Output: `docs/architecture.md` — definitive architecture reference for maintaining consistency.

## Instructions

### 1. Architecture Detection

Analyze project structure to identify:
- Architectural pattern(s): MVC, Clean Architecture, Layered, Hexagonal, Microservices, Monolithic, Serverless
- Tech stacks from config files, dependencies, and framework patterns
- Organizational approach: by feature, by layer, by domain

### 2. Architectural Overview

- Overall approach, guiding principles, and boundaries
- Component diagram (Mermaid): high-level overview, interactions, data flow
- Hybrid patterns or adaptations from standard architectures

### 3. Core Components

Per component document:
- **Purpose**: Function, scope, domain boundaries
- **Structure**: Module organization, key abstractions, design patterns
- **Interactions**: Communication methods, interfaces, DI, events
- **Extension points**: Plugins, configuration, hooks

### 4. Layers & Dependencies

- Layer structure and dependency rules (what depends on what)
- Abstraction mechanisms enforcing separation
- DI patterns and service registration
- Violations or circular dependencies (if any)

### 5. Data Architecture

- Domain model structure, entity relationships
- Data access patterns: repositories, query builders, ORMs
- Data transformation, validation, caching strategies

### 6. Cross-Cutting Concerns

| Concern | Document |
|---------|----------|
| **Auth** | Security model, permissions, session/token strategy |
| **Error handling** | Exception patterns, error boundaries, fallbacks |
| **Logging** | Instrumentation, observability approach |
| **Validation** | Input validation, business rules, error reporting |
| **Config** | Environment strategy, secrets, feature flags |

### 7. API & Service Communication

- API style (REST/GraphQL/tRPC), versioning, route organization
- Sync vs async patterns, background jobs
- External service integrations, adapters

### 8. Testing Architecture

- Test strategy by layer (unit, integration, E2E)
- Test boundaries and isolation patterns
- Mocking strategy, test data management

### 9. Deployment Architecture

- Deployment topology, containerization, CI/CD
- Environment configuration strategy
- Runtime dependencies, cloud services

### 10. Blueprint for New Development

- **Workflow**: Where to start by feature type, component creation sequence, integration steps
- **Templates**: Standard file structure for new features, components, services, tests
- **Pitfalls**: Common architecture violations, performance traps, testing blind spots

Include generation timestamp.
