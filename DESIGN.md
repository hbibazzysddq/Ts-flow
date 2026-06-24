---
name: TaskFlow
description: Real-time Kanban board for visual task management and team collaboration
colors:
  primary: "#6366f1"
  primary-50: "#eef2ff"
  primary-100: "#e0e7ff"
  neutral-bg: "#f9fafb"
  neutral-surface: "#ffffff"
  neutral-border: "#e5e7eb"
  neutral-text: "#111827"
  neutral-text-secondary: "#6b7280"
  neutral-text-muted: "#9ca3af"
  neutral-text-disabled: "#d1d5db"
  priority-high-bg: "#fff1f2"
  priority-high-text: "#e11d48"
  priority-medium-bg: "#fefce8"
  priority-medium-text: "#ca8a04"
  priority-low-bg: "#f0fdf4"
  priority-low-text: "#16a34a"
typography:
  display:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 4vw, 2rem)"
    fontWeight: 700
    lineHeight: 1.2
  headline:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.4
  caption:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "20px"
  xxl: "24px"
  xxxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: "10px 16px"
    typography: "{typography.body}"
    fontWeight: 500
  button-primary-hover:
    backgroundColor: "#4f46e5"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-text-secondary}"
    rounded: "{rounded.sm}"
    padding: "6px 10px"
    typography: "{typography.label}"
  card:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    border: "1px solid {colors.neutral-border}"
  input:
    backgroundColor: "{colors.neutral-surface}"
    rounded: "{rounded.sm}"
    padding: "10px 12px"
    typography: "{typography.body}"
    border: "1px solid {colors.neutral-border}"
---

# Design System: TaskFlow

## 1. Overview

**Creative North Star: "The Collaborative Canvas"**

TaskFlow is a collaborative Kanban board built for small teams who need to organize work without drowning in features. The interface is a clean, flat canvas where board colors — not chrome — carry the personality. Every design decision serves the workflow: drag a task, assign a member, leave a comment, move on.

The system explicitly rejects the dense, dark-mode-heavy, enterprise-tool aesthetic of Jira and Linear. Instead it takes cues from Trello's simplicity: approachable, colorful, and unintimidating. Interiors are light (cool gray-50 body, white surfaces), borders define containers instead of shadows, and the single Indigo accent (`#6366f1`) is used sparingly — on primary actions, active states, and the logo.

**Key Characteristics:**
- Flat by default; surfaces are defined by subtle borders (`gray-200`), not shadows
- Board colors are the primary source of visual personality — the UI chrome stays neutral
- Lightweight interactions: inline edit, drag-and-drop, instant sync
- Typography is single-family Inter at `14px` body — no hero typography, no display flourishes
- Motion is restrained: state transitions at 150–200ms, no choreographed entrances

## 2. Colors

A restrained palette: cool neutral backgrounds with a single Indigo accent. Board-level color is the user's own choice (8 swatches), not a system imposition.

### Primary

- **Playful Indigo** (`#6366f1`): The single accent. Used on primary buttons, the logo, active nav items, focus rings, and link text. Never applied to more than ~10% of any given screen.

### Neutral

- **Body Background** (`#f9fafb` / gray-50): The canvas. Cool, barely-there gray.
- **Surface** (`#ffffff`): Cards, modals, nav bars, inputs.
- **Border** (`#e5e7eb` / gray-200): The primary container delineator. Cards, inputs, modals, dividers.
- **Text Primary** (`#111827` / gray-900): Body copy, headings.
- **Text Secondary** (`#6b7280` / gray-500): Labels, descriptions, metadata.
- **Text Muted** (`#9ca3af` / gray-400): Placeholder text, disabled states, secondary metadata.

### Semantic

- **High Priority** — bg `#fff1f2`, text `#e11d48`
- **Medium Priority** — bg `#fefce8`, text `#ca8a04`
- **Low Priority** — bg `#f0fdf4`, text `#16a34a`

### Named Rules

**The Accent Rarity Rule.** The primary Indigo covers ≤10% of any screen. Its restraint is the point — when the user sees Indigo, they know it means "action."

**The Board-Color-First Rule.** The UI chrome is always neutral (`gray-50`/`gray-200`/`white`). Color on the page comes from board swatches and priority badges, not from decorative UI accents. The user's boards are the personality.

## 3. Typography

**Body Font:** Inter (`14px`, weight 400–700) — a clean, legible humanist sans-serif with excellent screen rendering across platforms.

This is a single-family system. No display font, no serif contrast. Inter carries the full hierarchy through weight and size alone.

### Hierarchy

- **Display** (Bold `28px–32px`, leading 1.2): Page-level headings only (Dashboard greeting, Login left-panel headline).
- **Headline** (Semibold `18px`, leading 1.3): Modal titles, section headers.
- **Title** (Semibold `14px`, leading 1.4): Card titles, list item names, button labels.
- **Body** (Regular `14px`, leading 1.5): Paragraphs, descriptions, input values. Max line length: 60–70ch.
- **Label** (Medium `12px`, leading 1.4): Form labels, field headers, stat labels. No uppercase.
- **Caption** (Regular `11px`, leading 1.4): Timestamps, metadata, badge text, helper copy.

### Named Rules

**The No-Headline-As-Design Rule.** Headlines stay at `24px` or below. There are no hero sections, no marketing typography. The app is a tool, not a landing page.

## 4. Elevation

Flat by default. Depth is communicated through subtle borders (`1px solid gray-200`), not shadows. This keeps the interface light, uncluttered, and consistent with the "canvas" metaphor — boards and cards sit on the surface, not above it.

Surfaces lift only on state:

- **Hover lift** (card, board card, task card): `box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1)` — the Tailwind `shadow-sm` equivalent. Applied on hover, removed at rest.
- **Modal backdrop** (`z-50`): `rgba(0, 0, 0, 0.25)` — subtle scrim, never opaque.
- **Modal surface**: `shadow-xl` (`0 20px 25px -5px rgb(0 0 0 / 0.1)`) — the sole use of significant shadow, reserved for focused interaction layers.

### Named Rules

**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only in direct response to state (hover on actionable elements, open modals). No card ever has a resting shadow.

## 5. Components

### Buttons

- **Shape:** Rounded corners (8px).
- **Primary:** Playful Indigo fill, white text, 14px semibold, 10px 16px padding. Hover: darken to `#4f46e5`. Transition: 150ms color.
- **Ghost:** Transparent, gray-500 text, 6px 10px padding. Hover: gray-100 background. Used for icon buttons, nav items, and secondary actions.
- **Disabled:** Opacity 50%, no hover effect. Cursor not-allowed.

### Cards

- **Corner Style:** Rounded (12px). Board cards and task cards.
- **Background:** White.
- **Border:** `1px solid gray-200`. Hover: `gray-300`.
- **Shadow (state only):** `shadow-sm` on hover — removed at rest.
- **Internal Padding:** 16px (cards), 12px (compact task cards).

### Inputs / Fields

- **Style:** White fill, `1px solid gray-200` stroke, 8px radius, 10px 12px padding.
- **Focus:** Indigo border (`#6366f1`), 2px Indigo ring at 10% opacity. No offset ring.
- **Placeholder:** Gray-400 (`#9ca3af`).
- **Error:** Red-50 background, red-100 border, red-600 text. Inline below input.
- **Disabled:** Gray-100 background, reduced opacity.

### Modals / Dialogs

- **Shape:** White fill, 16px radius, `1px solid gray-200`, `shadow-xl`.
- **Backdrop:** Fixed inset, `rgba(0, 0, 0, 0.25)`, z-50. Click-to-dismiss.
- **Padding:** 20px 24px (header), 20px 24px (body).
- **Animation:** Fade in 180ms (`fade-in` class: opacity 0→1, translateY 4px→0).

### Navigation (Top Nav)

- **Style:** White fill, `1px solid gray-200` bottom border, 56px height, sticky top.
- **Typography:** 14px semibold for brand name, 13px medium for nav links.
- **States:** Ghost button style (gray-500 → gray-900 on hover, gray-100 background).
- **Mobile:** Nav links hide on mobile (below `sm` breakpoint); primary action becomes a FAB.

### Chips / Badges

- **Priority Chips:** 11px medium, 6px 8px padding, rounded 6px, colored background + text per priority level. Border matches background hue at the same lightness.
- **Status Badges:** 10px (invite count), red-500 fill, white text, circular, absolutely positioned on bell icon.

### Avatars

- **Shape:** Circular, 28px by default. Half the available palette hues; assigned by role (owner → primary/10 bg + primary text, member → gray-200 bg + gray-600 text).
- **Content:** First letter of email, 11px bold. Uppercase.
- **Stacking:** Overlapping with negative margin (`-space-x-2`), white border separator. Max 4 shown, then "+N" overflow badge.

## 6. Do's and Don'ts

### Do

- **Do** use the Indigo accent sparingly — one primary button, one link, one active tab per page.
- **Do** let board colors carry the visual personality. The chrome stays neutral.
- **Do** use borders, not shadows, to define containers at rest.
- **Do** prefer inline editing over modals for task properties (title, description, priority).
- **Do** keep motion to 150–200ms ease-out transitions (state changes only).
- **Do** show real-time status (Wifi icon) so the user knows sync is live.
- **Do** use the `fade-in` animation for entering modals and new content.

### Don't

- **Don't** create a Jira/Linear/Notion clone — no dark mode by default, no dense sidebars, no overflowing metastrip headers.
- **Don't** use gradient text, glassmorphism, or decorative blurs anywhere.
- **Don't** apply shadows to cards at rest. Shadows mean "this is elevated right now."
- **Don't** use border-left greater than 1px as a colored accent stripe on cards or list items.
- **Don't** put tiny uppercase tracked eyebrows ("CREATE" "MANAGE") above section headings.
- **Don't** hide primary actions behind nested menus or kebab icons — inline or directly visible.
- **Don't** use hero-metric layouts (big number, small label, gradient accent). Stats are simple cards with icon + value + label.
- **Don't** gate content visibility on class-triggered transitions (fade-in must also render instantly at the server/static level).
- **Don't** disable reduced-motion support. All animations must have a `prefers-reduced-motion: reduce` path.
