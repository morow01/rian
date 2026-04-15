# Theme Migration Plan — v5.6.x series

Started **v5.6.0**. Goal: enable multiple user-selectable themes (dark, Gameboy, Win 3.1, B&W, iOS, etc.) by migrating hardcoded colors to CSS variables and restoring a theme switcher.

## Why this is needed

App has ~1,134 hex color occurrences across 212 distinct values. Of those:
- **~80% are already aliased** via CSS variables (defined in `:root` block at the top of app.html)
- **~180 occurrences** remain hardcoded and are *structural* — backgrounds, text, borders that need to change per theme
- **~170 occurrences** are brand/status colors (red for error, green for success, etc.) that should stay fixed regardless of theme
- **~17 occurrences** are SVG icon fills that should stay fixed

The hardcoded structural colors are concentrated in:
1. CSS rules that were written before the variable system was fleshed out
2. Inline `style=""` attributes inside JS template literals
3. SVG `fill/stroke` attributes in generated HTML

## Current state

- `:root` block (~line 29–83) has 54 variables covering most of the app.
- `[data-theme="claude"]` block (~line 1736) duplicates the root variables — historic artifact from when Rob had multiple themes before.
- `initTheme()` (~line 23781) force-sets `data-theme="claude"` on every load.
- `setTheme()` is a stub (`/* themes removed */`). Earlier themes (Gameboy, Retro, Win 3.1, B&W, iOS) were deleted from the code.

## Variables already defined

```
--font-body, --font-mono
--bg-page, --bg-header, --bg-header-tab, --bg-card, --bg-card-alt, --bg-day-header, --bg-day-header-we
--bg-input, --bg-modal, --bg-modal-search, --bg-code-btn, --bg-code-group, --bg-code-item, --bg-code-item-sel
--bg-ot, --summary-even
--text-header, --text-header-sub, --text-primary, --text-secondary, --text-muted, --text-day, --text-day-we, --text-hours, --text-input, --text-ot
--accent, --accent-light, --accent-chip-bg, --accent-chip-text
--border, --border-input
--btn-danger-color, --btn-danger-bg, --btn-danger-border
--shadow-card, --overlay, --tab-active
--priority-high, --priority-high-dark, --priority-high-bg, --priority-high-bg-strong, --priority-high-border
--priority-medium, --priority-medium-bg, --priority-medium-bg-strong, --priority-medium-border
--priority-low, --priority-low-dark, --priority-low-bg, --priority-low-bg-strong, --priority-low-border
```

## New variables needed (to be added in v5.6.1)

Gaps found during audit that should become themable:

- `--border-strong` — darker divider for section boundaries (currently `#cbd5e1`, `#e2e8f0`)
- `--bg-section-muted` — like `#f8fafc` when `--bg-input` feels too blue for the context
- `--text-display` — heading text distinct from `--text-primary` (currently `#1F2937`, `#3A3836`)
- `--shadow-sm`, `--shadow-md`, `--shadow-lg` — normalize the drop-shadow variants
- `--gradient-success-from`, `--gradient-success-to` — endpoints for the green button gradient used by Battery Recorder
- `--gradient-brand-from`, `--gradient-brand-to` — for any brand gradients
- `--mix-10`, `--mix-20`, `--mix-40` OR individual rgba() variables — for the repeated `rgba(color, 0.x)` tints used on chips and state pills (decide approach in v5.6.1)

## Migration steps (one commit each)

| Version | Scope | Risk |
|---|---|---|
| **v5.6.0** | This plan doc only — no code changes | none |
| **v5.6.1** | Add new variables to `:root` block, values matching current hardcodes | none (nothing consumes them yet) |
| **v5.6.2** | Migrate structural backgrounds in CSS blocks: `#f8fafc`, `#FFFFFF`, `#F4F7FA` → `var(--bg-input)` etc. Skip inline `style=""` for now | low |
| **v5.6.3** | Migrate structural text in CSS blocks: `#94a3b8`, `#6B7280`, `#3A3836` → `var(--text-*)` | low |
| **v5.6.4** | Migrate borders in CSS blocks: `#e2e8f0`, `#D4E0EC`, `#dcdad4` → `var(--border)`/`var(--border-strong)` | low |
| **v5.6.5** | Migrate shadows and rgba overlays to new variables | low |
| **v5.6.6** | Migrate gradients — extract endpoints to vars | low |
| **v5.6.7** | Migrate inline `style=""` in JS template literals — hex → var() | medium (JS refactor) |
| **v5.6.8** | Restore `setTheme()` and add theme selector UI in hamburger menu; persist to localStorage | medium (JS + UI) |
| **v5.6.9** | Add **Dark** theme block | low (just new CSS) |
| **v5.6.10** | Add **Gameboy** theme block | low |
| **v5.6.11** | Add **Win 3.1** theme block | low |
| **v5.6.12** | Add **B&W** theme block | low |
| **v5.6.13** | Add **iOS** theme block | low |

## Guiding rules during migration

1. **Never touch SVG path fills** (`<path fill="#..." />`) in icons — those stay hardcoded by design.
2. **Never change status colors** (red/green/amber for priority, error, success) unless specifically designing a theme that needs them themed.
3. **Use fallback syntax** `var(--name, #hardcoded)` everywhere so a missing variable in a partial theme never breaks the app.
4. **App must look visually identical** through v5.6.0–5.6.7. Only v5.6.9+ should produce visible changes, and only when the user explicitly picks a new theme.
5. **Commit per category** so any single step can be reverted if something breaks.
6. **Track each step** with a short note in this file when completed.

## Known gotchas (from the audit)

- **Case inconsistency**: `#FFFFFF` vs `#ffffff`, `#F5A623` vs `#f5a623`. All search/replace must be case-insensitive.
- **`backdrop-filter` creates containing blocks**: already bit us with the reminder modal. If we add any new blurred surfaces during theming, test every `position: fixed` descendant.
- **JS template literal styles** (e.g. `style="background:${x}"`) — these aren't in the CSS blocks, so CSS-variable migration alone won't fix them. Plan step 5.6.7 handles these.
- **rgba() opacity tints**: `#F5A623` with 10% opacity is written as `rgba(245,166,35,0.10)` — not trivially swappable. Decision needed in v5.6.1: introduce N-variants (`--accent-alpha-10`) or use CSS `color-mix()` (less browser support but cleaner).

## Progress log

- **v5.6.0** — Plan doc committed (this file).
- **v5.6.1** — Added new CSS variables to `:root`: bg-section-muted, bg-weekend, text-display, text-warm, border-strong/-warm/-warm-light/-subtle/-medium, shadow-sm/-md/-lg/-brand-sm/-brand-md, gradient-success-from/-to, gradient-brand-from/-to, gradient-warn-from/-to, accent-alpha-06/-10/-30, amber-alpha-10/-40, slate-alpha-10/-40, blue-alpha-10/-40. Values match current hardcodes. No visual change — nothing consumes the new vars yet.
- **v5.6.2** — Harmonized input-field background: `--bg-input` changed from `#F4F7FA` to `#f8fafc` (per user — DUE DATE was slightly darker than other fields). All `background: #f8fafc` CSS rules (~12 occurrences) migrated to `var(--bg-input)`. Inputs that referenced `var(--bg-input)` via inline style now match Description/Location's hardcoded `#f8fafc`. Minor visible change: inputs that previously used `--bg-input` are a touch lighter. Backgrounds are now theme-responsive.
- **v5.6.3** — Unified field borders + border-radius. `.note-detail` input/textarea borders migrated from hardcoded `#e2e8f0` to `var(--border-strong)`. `.note-inline-empty` and `.note-inline-preview` switched from `var(--border)` (#D4E0EC blue-tinted) to `var(--border-strong)` (#e2e8f0 neutral gray) to match all other fields. DUE DATE inline `style="..."` override stripped so it picks up the shared CSS rule (12px radius, neutral gray border). All fields now have identical border color and radius.
- **v5.6.4** — Migrated remaining structural CSS-block backgrounds. `.week-list`, `.day-card`, `.day-card.expanded`, timeline node circle, `.notes-panel-body`, `[data-theme="claude"] .day-header`: `#FFFFFF` → `var(--bg-card)`. `.sum-table thead tr`: `#F4F7FA` → `var(--bg-card-alt)`. Skipped `tt-swatch` color picker (intentionally white). No visual change — values are identical.
- **v5.6.5** — Exact-match text color migrations (12 replacements, no visual change): `color: #0F1C2E` → `var(--text-primary)` (3), `color: #8BA5BE` → `var(--text-muted)` (4), `color: #3A3836` → `var(--text-warm)` (5). Next step (v5.6.6) will tackle near-match clusters `#64748b`, `#94a3b8`, `#1e293b` by adding precise variables.
- **v5.6.6** — Harmonize field padding to 10px 12px (matches Reminder card). `.note-detail` inputs, `.note-inline-empty`, `.note-inline-preview` changed from `12px 14px` to `10px 12px`. Minor visible change: fields slightly shorter.
- **v5.6.7** — Added precise text color variables (`--text-slate: #64748b`, `--text-dim: #94a3b8`, `--text-ink: #1e293b`) and migrated 44 CSS-block `color:` occurrences to use them. No visual change — variable values equal prior hardcodes. Inline-style JS template-literal hex colors still hardcoded; deferred to v5.6.10.
- **v5.6.8** — Shadows become themable. Added `--shadow-rgb: 0, 0, 0` and `--shadow-brand-rgb: 15, 28, 46` (RGB triples without alpha). Migrated 54 `rgba(0, 0, 0, X)` and 2 `rgba(15, 28, 46, X)` occurrences inside `box-shadow:` declarations to use `rgba(var(--shadow-rgb), X)` and `rgba(var(--shadow-brand-rgb), X)` respectively. Zero visual change. Future themes (e.g. Gameboy) can tint all generic shadows by overriding these two RGB vars. Accent/status-tinted shadows (e.g. `rgba(45, 107, 228, X)`) left alone — those track brand/status colors intentionally.
- **v5.6.9** — Gradients migrated to variables. 5 gradient uses (3 CSS rules + 2 inline styles in battery modal) now reference `--gradient-success-from/-to`, `--gradient-brand-from/-to`, `--gradient-warn-from/-to`. Success gradient used at `.bat-avatar`, battery modal icon, battery progress fill. Zero visual change.
