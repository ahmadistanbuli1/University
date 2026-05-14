# Arabic / English UI, RTL, and i18n architecture

This document complements [5-master-plan.md](5-master-plan.md). End-user UI treats **Arabic as the primary language** with **English** as a supported secondary locale.

## Goals

1. **RTL-first layouts** — spacing, navigation, and overlays must behave correctly when `document.documentElement.dir` is `rtl`.
2. **Scalable i18n** — add namespaces and JSON translation files instead of growing a single flat file without structure.
3. **No hardcoded user-visible strings** in feature components — use `react-i18next` (`useTranslation`, `Trans`) and keys.
4. **Runtime locale + direction** — `client/src/i18n/syncDocumentDirection.ts` keeps `lang` and `dir` aligned with the active i18n language (e.g. `ar` → `rtl`, `en` → `ltr`).

## Repository layout (frontend)

| Path | Role |
|------|------|
| `client/src/i18n/config.ts` | i18next initialization, default `lng: 'ar'`, `fallbackLng: 'en'`, language detection (localStorage key `university_i18nLng`). |
| `client/src/i18n/resources.ts` | Registers locale JSON bundles (start with `common`; add `news`, `library`, etc. later). |
| `client/src/i18n/syncDocumentDirection.ts` | Updates `<html lang>` and `<html dir>`. |
| `client/src/locales/<locale>/<namespace>.json` | UI strings only (no business rules). |

## Implementation rules (for upcoming tasks)

- Prefer **namespace per feature** (`library`, `academic`, `auth`) once screens grow; keep `common` for shell chrome (nav, buttons, errors).
- Use logical CSS where possible (`margin-inline`, `padding-inline`, `text-align: start`) or Tailwind **logical** utilities when Tailwind is wired (M8).
- Avoid mirroring icons that have a fixed meaning in LTR culture unless a mirrored asset exists; use symmetric icons when unsure.
- **API payloads** stay language-agnostic; localized strings are a frontend concern unless the product later requires multilingual CMS fields (then model per-locale columns or JSON columns in Prisma — out of scope until specified).

## Backend

- No change to MVCS responsibilities: optional `Accept-Language` for future localized emails/PDFs can be handled in services later without altering the Prisma schema from [2-database-schema.md](2-database-schema.md).
