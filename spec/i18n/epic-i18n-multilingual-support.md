# Epic: Multilingual Support (i18n)

- **Epic ID:** EPIC-I18N
- **Status:** Draft
- **Date:** 2026-04-06

## Goal

Enable the RBAC module to serve users in multiple languages, removing the English-only barrier and supporting a Vietnamese-speaking user base as the first expansion locale.

## Features

| Feature | File | Status |
|---|---|---|
| i18n — English & Vietnamese Locales | [i18n-locales.md](./i18n-locales.md) | Draft |

## Success Metrics

- 100% of user-visible strings translated for both `en` and `vi`
- Zero untranslated fallback strings visible in production for either locale
- Language switcher present and functional on all pages
- Locale preference persists across sessions for authenticated users

## Out of Scope for this Epic

- Additional locales beyond `en` and `vi`
- Back-end API response localization
- Email / notification localization
