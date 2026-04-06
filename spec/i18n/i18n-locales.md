# Feature Specification: Internationalization (i18n) — English & Vietnamese Locales

- **Feature ID:** FEAT-I18N-001
- **Epic:** [epic-i18n-multilingual-support.md](./epic-i18n-multilingual-support.md)
- **Status:** Draft
- **Date:** 2026-04-06
- **Author:** Spec Builder Agent

---

## 1. Feature Name

**Internationalization (i18n) — English & Vietnamese Locale Support**

---

## 2. Epic

**Epic: Multilingual Support**

This feature is the foundational i18n implementation for the RBAC module. It enables the application to serve content in multiple languages, beginning with English (`en`) as the default locale and Vietnamese (`vi`) as the first supported alternate locale.

---

## 3. Purpose & Scope

### Purpose

The RBAC module currently presents all text in English only. This feature introduces locale-aware content rendering across the entire application — including authentication flows, protected pages, admin interfaces, error pages, and navigation — so that Vietnamese-speaking users can interact with the system in their native language.

### Scope

This specification covers:

- All user-facing text strings in the application (labels, headings, messages, errors, buttons, placeholders)
- Locale detection and selection (browser preference + manual user toggle)
- Locale persistence across sessions
- Translation coverage for both `en` (English) and `vi` (Vietnamese)
- Locale-aware URL routing strategy
- Role-based and permission-based UI elements (badges, gates) translated appropriately

### Intended Audience

Product team, engineering team, QA, and content/translation teams.

### Assumptions

- English is the default fallback locale
- Vietnamese is the first non-English locale to ship
- Additional locales are out of scope for this feature
- Right-to-left (RTL) layout support is not required

---

## 4. User Personas

| Persona | Role(s) | i18n Relevance |
|---|---|---|
| **Admin** | `admin` | Manages users and roles; needs all admin UI translated |
| **Manager** | `manager` | Accesses reports and orders; needs operational pages translated |
| **Standard User** | `user` | Browses dashboard and profile; needs core navigation and dashboard translated |
| **Guest** | `guest` | Read-only access; needs public-facing pages and auth pages translated |
| **Unauthenticated Visitor** | — | Sees login, register, and error pages; must be translated |

---

## 5. User Stories

### Authentication & Public Pages

**US-001**
As an **unauthenticated visitor**,
I want the login and registration pages to display in my preferred language,
So that I can understand and complete the authentication process without a language barrier.

**US-002**
As an **unauthenticated visitor**,
I want to see error messages (e.g., "Invalid credentials", "Email already in use") in my preferred language,
So that I can act on the feedback without needing to interpret English text.

### Locale Selection

**US-003**
As any **authenticated or unauthenticated user**,
I want to manually switch between English and Vietnamese at any point,
So that I can change my language preference without logging out or losing my current context.

**US-004**
As a **returning authenticated user**,
I want my language preference to be remembered across sessions,
So that I do not need to re-select my language every time I log in.

**US-005**
As a **new visitor**,
I want the application to automatically detect my browser's preferred language and display the matching locale (if supported),
So that I see the correct language without any manual action.

### Protected Pages & Navigation

**US-006**
As a **standard user**,
I want the dashboard, navigation, and all labels within the protected area to appear in my chosen locale,
So that I can navigate and use the application fluently.

**US-007**
As an **admin**,
I want the Users and Roles management pages to be fully translated,
So that I can perform administrative tasks in my preferred language.

**US-008**
As a **manager**,
I want the Reports and Orders pages to display in my preferred language,
So that I can interpret and act on operational data without language confusion.

### Error & Status Pages

**US-009**
As any **user**,
I want the 401 Unauthorized and 403 Forbidden pages to display in my preferred language,
So that I understand why access was denied.

**US-010**
As any **user**,
I want validation error messages and form feedback to appear in my preferred language,
So that I can correct my input effectively.

---

## 6. Requirements

### Functional Requirements

- **REQ-001:** The application MUST support two locales: `en` (English) and `vi` (Vietnamese).
- **REQ-002:** English (`en`) MUST be the default locale when no preference is detected or set.
- **REQ-003:** All user-visible text strings MUST have translations defined for both `en` and `vi`. No locale may contain untranslated (fallback) strings in the shipped version.
- **REQ-004:** The system MUST provide a visible language switcher control accessible on all pages (both public and protected).
- **REQ-005:** The system MUST detect the user's browser language preference on first visit and select the best matching supported locale.
- **REQ-006:** The selected locale MUST persist across page navigations within the same session.
- **REQ-007:** The selected locale for an authenticated user MUST persist across sessions (i.e., survive logout and re-login).
- **REQ-008:** Locale switching MUST NOT require a full page reload where technically avoidable; if a reload is required, the user must remain on the same logical page.
- **REQ-009:** All form validation messages — including Zod-generated field errors — MUST be translatable and displayed in the active locale.
- **REQ-010:** RBAC-specific UI text (role badge labels, permission-gate fallback messages, action/resource names) MUST be translated for both locales.
- **REQ-011:** Date, number, and currency formats MUST respect locale conventions where they appear (e.g., `vi` uses Vietnamese date formatting).
- **REQ-012:** The URL structure MUST reflect the active locale (e.g., `/en/dashboard` or `/vi/dashboard` — OR via cookie/header without URL prefix; the chosen strategy must be consistent throughout the application).

### Security Requirements

- **SEC-001:** Locale selection MUST NOT bypass or interfere with any authentication or authorization check. Auth state is independent of locale state.
- **SEC-002:** User-supplied locale values (from URL, cookie, or header) MUST be validated against the whitelist of supported locales (`en`, `vi`). Invalid values MUST fall back to the default locale.
- **SEC-003:** Translated strings MUST be sanitized before rendering; no translation value may inject executable markup or scripts.

### Constraint Requirements

- **CON-001:** The feature MUST cover all pages within the following route groups: `(auth)`, `(protected)`, `(protected)/(admin)`, `(protected)/(manager)`, and the root error pages (`unauthorized.tsx`, `forbidden.tsx`).
- **CON-002:** The language switcher MUST be accessible (keyboard-navigable and screen-reader-compatible) per WCAG 2.1 AA.
- **CON-003:** Adding a new locale in the future MUST require only: (a) a new translation file, and (b) adding the locale code to a supported-locales registry. No structural code changes should be required.

### Guideline Requirements

- **GUD-001:** Translation keys MUST be organized by feature/page domain (e.g., `auth.login.title`, `admin.users.heading`) for maintainability.
- **GUD-002:** Translation files for `en` and `vi` MUST be kept in sync; a missing key in any locale is a defect.
- **GUD-003:** The language switcher component MUST display locale labels in the target language itself (e.g., "English", "Tiếng Việt"), not in the currently active locale.

---

## 7. Acceptance Criteria

### Locale Detection & Defaults

**AC-001**
Given a new visitor with no stored locale preference,
When their browser language is set to `vi` or `vi-VN`,
Then the application displays in Vietnamese.

**AC-002**
Given a new visitor with no stored locale preference,
When their browser language is set to any language other than Vietnamese,
Then the application displays in English (default fallback).

**AC-003**
Given a user manually selects Vietnamese via the language switcher,
When they navigate to any page,
Then all text on that page is displayed in Vietnamese.

### Locale Persistence

**AC-004**
Given an authenticated user has selected Vietnamese,
When they log out and log back in,
Then the application still displays in Vietnamese.

**AC-005**
Given a user has selected a locale,
When they navigate between pages within the same session,
Then the locale does not reset.

### Language Switcher

**AC-006**
Given any page in the application (public or protected),
When the user looks for the language switcher,
Then it is visible and operable without scrolling on standard viewports.

**AC-007**
Given the language switcher is rendered,
When the user activates it via keyboard (Tab + Enter/Space),
Then the locale changes and focus behavior does not break.

**AC-008**
Given the language switcher is active,
When it displays available locales,
Then English is labeled "English" and Vietnamese is labeled "Tiếng Việt" regardless of the currently active locale.

### Translation Coverage

**AC-009**
Given the active locale is Vietnamese,
When the user visits the Login page,
Then all visible text — including labels, placeholders, buttons, and error messages — is in Vietnamese with no English fallback text visible.

**AC-010**
Given the active locale is Vietnamese,
When the user visits the Users or Roles admin pages,
Then all headings, table headers, action buttons, and confirmation messages are in Vietnamese.

**AC-011**
Given the active locale is Vietnamese,
When the user submits a form with invalid data,
Then all validation error messages are displayed in Vietnamese.

**AC-012**
Given the active locale is English,
When the user visits any page,
Then all visible text is in English and no Vietnamese text is visible.

### Error Pages

**AC-013**
Given a user without a valid session attempts to access a protected page,
When the 401 Unauthorized page renders,
Then its content respects the user's stored or detected locale.

**AC-014**
Given an authenticated user is denied access due to insufficient permissions,
When the 403 Forbidden page renders,
Then its content respects the user's active locale.

### Security

**AC-015**
Given a malicious actor passes an unsupported locale value via URL parameter or cookie,
When the system processes the request,
Then it falls back to the default locale (`en`) without throwing an error or exposing stack traces.

**AC-016**
Given a translation value contains HTML markup or script tags,
When it is rendered to the page,
Then the markup is escaped and not executed in the browser.

---

## 8. Test & Validation Criteria

### Test Perspectives

| Perspective | What to Verify |
|---|---|
| **Locale Detection** | Browser language header correctly maps to `en` or `vi`; unknown locales fall back to `en` |
| **Locale Persistence** | Cookie/storage is set correctly; survives page refresh, navigation, and re-login |
| **Translation Completeness** | All keys present in `en` file also exist in `vi` file and vice versa (no missing keys) |
| **Language Switcher UX** | Switcher visible on all pages; switching applies immediately; correct labels |
| **Form & Validation Errors** | Zod error messages translated; displayed errors match active locale |
| **RBAC UI Strings** | Role badge labels, permission-denied messages translated in both locales |
| **Error Pages** | 401 and 403 pages respect locale |
| **Security** | Invalid locale inputs are rejected and fall back safely; rendered strings are escaped |

### Critical Edge Cases

- **EC-001:** User switches locale mid-form (e.g., halfway through registration) — form state should be preserved and validation messages should switch to the new locale.
- **EC-002:** User has Vietnamese preference but visits a URL with an `/en/` prefix — locale resolution order and conflict handling must be defined and consistent.
- **EC-003:** A translation key exists in `en` but is missing from `vi` — the system must surface this as a build-time or CI warning, not a silent runtime fallback.
- **EC-004:** Text expansion in Vietnamese — some Vietnamese phrases are longer than their English equivalents; UI must not break layout (e.g., buttons must not overflow).
- **EC-005:** Authenticated user's locale preference is stored, then the user's session is revoked by an admin — the locale preference should survive and apply when the user re-authenticates.

---

## 9. Out of Scope

The following items are explicitly **not** included in this feature:

- **Additional locales** beyond English and Vietnamese (e.g., French, Japanese, Chinese) — future epic.
- **Right-to-left (RTL) layout support** — no RTL locales are targeted.
- **Machine translation / auto-translation** — all translations must be human-authored.
- **Admin UI for managing translation strings** — translations are managed in source files, not via a CMS or admin panel.
- **Email and notification localization** — out of scope; handled in a separate notification feature.
- **SEO-specific locale metadata** (hreflang tags, locale-specific sitemaps) — addressed in a separate SEO epic if required.
- **Locale-specific content variations** (e.g., region-specific pricing, images, or legal text) — only UI string translation is in scope.
- **Pluralization rules** beyond simple singular/plural — complex grammatical number forms are out of scope for V1.
- **Back-end / API response localization** — API error codes and data remain in a neutral format; only UI layer strings are translated.
