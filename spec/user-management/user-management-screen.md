# Feature Specification: User Management Screen

- **Feature ID:** FEAT-UM-001
- **Epic:** [epic-user-management.md](./epic-user-management.md)
- **Status:** Draft
- **Date:** 2026-04-06
- **Author:** Spec Builder Agent

---

## 1. Feature Name

**User Management Screen — Create, Edit & Detail View**

---

## 2. Epic

**Epic: User Management**

This feature extends the existing read-only Users listing page with Create, Edit, and Detail View capabilities, gated by the RBAC permission model. It is the primary interface for administrators to manage user accounts and for managers to inspect user records.

---

## 3. Purpose & Scope

### Purpose

The current Users page allows `admin`-privileged users to list all accounts in the system. This feature adds three new interaction surfaces:

1. **Create User** — Admin can open a form to register a new user without requiring self-registration.
2. **Edit User** — Admin can update a user's name, email, and role assignments.
3. **Detail View** — Admin and Manager can view the full profile of a single user (name, email, roles, permissions, creation date).

### Scope

This specification covers:

- A **Create User** form/dialog accessible only to users with `CREATE` permission on the `USERS` resource
- An **Edit User** form/dialog accessible only to users with `UPDATE` permission on the `USERS` resource
- A **User Detail** view/panel accessible to users with `READ` permission on the `USERS` resource and the `admin` or `manager` role
- Form validation for all write operations
- Permission-gate enforcement on every entry point (button, route, server action)
- Success and error feedback for all form submissions

### Intended Audience

Product team, engineering team, QA.

### Assumptions

- The `admin` role holds `MANAGE` on `USERS`, which implies `CREATE`, `READ`, `UPDATE`, `DELETE`
- The `manager` role holds at minimum `READ` on `USERS`
- A newly created user receives no role by default unless one is explicitly assigned during creation
- Email addresses are unique across the system
- Password for a newly created user is set by the admin; the user is not sent a reset email in this feature

---

## 4. User Personas

| Persona | Role(s) | Relevant Capability |
|---|---|---|
| **Super Admin** | `admin` | Full access — create, edit, view detail |
| **Manager** | `manager` | Read-only — view user detail only |
| **Standard User** | `user` | No access to User Management |
| **Guest** | `guest` | No access to User Management |

---

## 5. User Stories

### Create User

**US-001**
As an **admin**,
I want to create a new user account from the Users management page,
So that I can provision accounts for colleagues without requiring them to self-register.

**US-002**
As an **admin**,
I want to assign one or more roles to a new user during the creation flow,
So that the user has the correct access level immediately upon account creation.

**US-003**
As an **admin**,
I want to receive clear validation feedback when required fields are missing or invalid,
So that I can correct errors before the record is saved.

### Edit User

**US-004**
As an **admin**,
I want to edit an existing user's name and email,
So that I can keep account information up to date.

**US-005**
As an **admin**,
I want to update a user's role assignments (add or remove roles),
So that I can adjust access levels as the user's responsibilities change.

**US-006**
As an **admin**,
I want to be prevented from accidentally submitting an edit form with duplicate or invalid data,
So that data integrity is preserved.

### User Detail View

**US-007**
As an **admin or manager**,
I want to view a user's full profile — including their name, email, assigned roles, derived permissions, and account creation date —
So that I can audit access rights without leaving the Users page.

**US-008**
As a **manager**,
I want the detail view to be read-only,
So that I can inspect user data without risking accidental modifications.

**US-009**
As an **admin**,
I want a direct link from the detail view to the edit form,
So that I can move quickly from inspection to editing without extra navigation.

---

## 6. Requirements

### Functional Requirements

- **REQ-001:** The Users page MUST display a "Create User" button visible only to users with `CREATE` permission on `USERS`.
- **REQ-002:** The Users table MUST display a "View Detail" action for each row, visible to users with `READ` permission on `USERS`.
- **REQ-003:** The Users table MUST display an "Edit" action for each row, visible only to users with `UPDATE` permission on `USERS`.
- **REQ-004:** The Create User form MUST collect: full name (optional), email (required), password (required), and role assignments (optional, multi-select from existing roles).
- **REQ-005:** The Edit User form MUST allow updating: full name, email, and role assignments. Password change is out of scope for this feature.
- **REQ-006:** The User Detail view MUST display: full name, email, account creation date, list of assigned roles, and the union of permissions derived from those roles.
- **REQ-007:** Upon successful user creation, the system MUST redirect to or refresh the Users list and display a success notification.
- **REQ-008:** Upon successful edit, the system MUST reflect the updated data immediately without a full page reload where possible.
- **REQ-009:** All available roles MUST be fetched from the database and presented as selectable options in both the Create and Edit forms.
- **REQ-010:** If a user has no roles assigned, the detail view MUST explicitly state that no roles are assigned.

### Security Requirements

- **SEC-001:** The Server Action for creating a user MUST call `requirePermission('CREATE', 'USERS')` as its first operation before any data processing.
- **SEC-002:** The Server Action for editing a user MUST call `requirePermission('UPDATE', 'USERS')` as its first operation.
- **SEC-003:** The Server Action (or Route Handler) serving the detail view data MUST enforce `requirePermission('READ', 'USERS')`.
- **SEC-004:** Passwords MUST be hashed before storage; plaintext passwords MUST never be logged, stored, or returned in any query result.
- **SEC-005:** The email uniqueness constraint MUST be enforced server-side; a duplicate email MUST return a user-visible field error, not an unhandled exception.
- **SEC-006:** An admin MUST NOT be able to remove all roles from a user in a way that creates an orphaned super-admin account that cannot be managed. (Business rule: the last `admin`-role user cannot have their `admin` role revoked.)
- **SEC-007:** All form inputs MUST be validated with Zod on the server before any database write occurs.

### Constraint Requirements

- **CON-001:** Permission checks MUST use the RBAC model: `Action × Resource` — never hardcoded role name strings in guard logic.
- **CON-002:** The detail view and edit action for each user row MUST be gated by `PermissionGate` on the server; they MUST NOT render for users lacking the required permission.
- **CON-003:** The feature MUST remain functional for authenticated users who carry `MANAGE` on `USERS` (which implies all actions).

### Guideline Requirements

- **GUD-001:** All user-visible text in forms, tables, and notifications MUST reference the translation system (`en` and `vi`) — no hardcoded strings.
- **GUD-002:** The Create and Edit forms SHOULD reuse the same field components and validation schema where possible to avoid duplication.

---

## 7. Acceptance Criteria

### Create User

**AC-001**
Given a user with `CREATE` permission on `USERS` is on the Users page,
When they activate the "Create User" button,
Then a Create User form is presented containing fields for name, email, password, and role assignment.

**AC-002**
Given the Create User form is open,
When the user submits it with a valid name, email, password, and at least one role,
Then a new user record is persisted and the Users list reflects the new entry.

**AC-003**
Given the Create User form is open,
When the user submits it with an email that already exists in the system,
Then an inline error is displayed on the email field stating that the email is already registered, and no record is created.

**AC-004**
Given the Create User form is open,
When the user submits it with the required fields left empty,
Then field-level validation errors are displayed and the form is not submitted.

**AC-005**
Given a user with only `READ` permission on `USERS`,
When they view the Users page,
Then the "Create User" button is not visible.

### Edit User

**AC-006**
Given a user with `UPDATE` permission on `USERS` is on the Users page,
When they activate the "Edit" action for a specific user row,
Then an Edit User form is presented pre-populated with the selected user's current name, email, and role assignments.

**AC-007**
Given the Edit User form is open,
When the user changes the name and submits,
Then the updated name is persisted and reflected in the Users list without navigating away.

**AC-008**
Given the Edit User form is open,
When the user removes all roles and submits,
Then the system permits the update (unless the user is the last admin — see AC-012), and the user's roles are cleared.

**AC-009**
Given the Edit User form is open,
When the user enters an email that is already used by another account and submits,
Then an inline error is shown on the email field and no update is persisted.

**AC-010**
Given a user with only `READ` permission on `USERS`,
When they view the Users page,
Then the "Edit" action button is not visible for any row.

### User Detail View

**AC-011**
Given a user with `READ` permission on `USERS` and either the `admin` or `manager` role,
When they activate the "View Detail" action for a user row,
Then a detail panel or page displays the user's name, email, roles, derived permissions, and creation date.

**AC-012**
Given a manager viewing the User Detail panel,
When the panel is open,
Then no edit controls are visible and no data can be modified from this view.

**AC-013**
Given an admin viewing the User Detail panel,
When they activate the "Edit" link or button within the detail view,
Then the Edit User form opens pre-populated with that user's data.

**AC-014**
Given a user who holds no roles is viewed in the detail panel,
When the Roles section renders,
Then it explicitly states that no roles are assigned to this user.

### Security

**AC-015**
Given an unauthenticated request or a request from a user without `CREATE` permission on `USERS`,
When the Create User Server Action is invoked directly,
Then the action returns a `forbidden` error and no record is created.

**AC-016**
Given an admin submits the Create User form with a plaintext password,
When the record is persisted,
Then the stored password value is a bcrypt hash, not the original plaintext.

**AC-017**
Given an admin attempts to remove the `admin` role from the only remaining admin account,
When the edit is submitted,
Then the system rejects the operation and returns a user-visible error explaining why.

---

## 8. Test & Validation Criteria

### Test Perspectives

| Perspective | What to Verify |
|---|---|
| **Permission gating** | Create button, Edit button, and View Detail button are each independently gated by the correct permission; absence of button when lacking permission |
| **Create happy path** | Valid form submission creates a record; Users list updates; roles are correctly persisted |
| **Create — duplicate email** | Server rejects the request with a field-level error; no duplicate record in DB |
| **Create — empty required fields** | Zod validation fires server-side; field errors are returned to the form |
| **Edit happy path** | Pre-populated form; change persisted correctly; list reflects updates |
| **Edit — role assignment change** | Adding and removing roles saves correctly; derived permissions update accordingly |
| **Detail view — admin** | All fields visible; Edit shortcut present |
| **Detail view — manager** | All fields visible; no edit controls |
| **Password hashing** | Stored value is a bcrypt hash; no plaintext appears in logs or API responses |
| **Last-admin guard** | System prevents removal of admin role from the sole admin account |
| **i18n** | All form labels, validation errors, notifications, and headings render correctly in both `en` and `vi` |

### Critical Edge Cases

- **EC-001:** Admin creates a user with the same email as a soft-deleted user (if soft-delete is ever introduced) — uniqueness check must cover all records.
- **EC-002:** Admin edits their own account and removes all their own roles — the system should warn and prevent self-lockout.
- **EC-003:** Two admin tabs open simultaneously editing the same user — last write wins; no silent data loss.
- **EC-004:** Extremely long name or email inputs — server-side length validation must reject them with a user-visible message, not a DB error.
- **EC-005:** Role list changes between the time the Edit form is opened and submitted (e.g., a role is deleted by another admin) — the server must handle the stale reference gracefully.

---

## 9. Out of Scope

The following items are explicitly **not** included in this feature:

- **Delete / deactivate user** — covered in a separate feature (User Deactivation).
- **Password change / reset for a user** — covered in a separate Password Management feature.
- **Bulk user actions** (multi-select create, edit, or delete) — future enhancement.
- **User profile self-edit** — this feature targets admin-driven management only; self-service profile editing is a separate feature.
- **Invite-by-email flow** — new users are created directly by admins; email invitations are out of scope.
- **Audit log of edits** — who changed what and when is tracked in a separate Audit feature.
- **Avatar or profile image upload** — out of scope.
- **Pagination or search on the Users list** — will be addressed in a separate List Enhancements feature.
