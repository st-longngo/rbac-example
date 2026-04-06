# Epic: User Management

- **Epic ID:** EPIC-UM
- **Status:** Draft
- **Date:** 2026-04-06

## Goal

Provide administrators and managers with a complete interface for managing user accounts — including creating new users, editing existing records, viewing detailed profiles, and (in later features) deactivating or auditing accounts.

## Features

| Feature | File | Status |
|---|---|---|
| User Management Screen (Create, Edit, Detail) | [user-management-screen.md](./user-management-screen.md) | Draft |
| User Deactivation | _planned_ | Not started |
| Password Reset by Admin | _planned_ | Not started |
| User List Enhancements (search, pagination) | _planned_ | Not started |

## Permission Matrix

| Action | Resource | Required Role(s) |
|---|---|---|
| `CREATE` | `USERS` | `admin` |
| `READ` | `USERS` | `admin`, `manager` |
| `UPDATE` | `USERS` | `admin` |
| `DELETE` | `USERS` | `admin` |
| `MANAGE` | `USERS` | `admin` (implies all above) |

## Success Metrics

- Admins can create a new user with role assignment in a single form submission
- Admins can edit name, email, and roles without leaving the Users page
- Managers can view any user's full profile in read-only mode
- Zero unauthorized access to write operations from non-admin roles

## Out of Scope for this Epic

- Self-service profile editing (separate User Profile epic)
- Email invite flow
- Bulk user operations
