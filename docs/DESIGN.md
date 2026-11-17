# Design system

The housing system reuses the structure of the Home Owners design system
(token-based palette, ink neutrals, semantic status colours, radius and type
scales) with a new palette: **royal blue** as the brand colour and **gold** as a
restrained accent.

All components use Tailwind tokens. Do not introduce raw hex values in component
class names.

## Palette

### Primary — royal blue

| Token                     | Hex       | Use                                |
| ------------------------- | --------- | ---------------------------------- |
| `primary-50`              | `#eef3fb` | Subtle backgrounds                 |
| `primary-100`             | `#d7e3f6` | Muted surfaces, allocated badges   |
| `primary-300`             | `#86a8df` | Disabled states, focus rings       |
| `primary-500` / `primary` | `#3561bb` | Primary actions, active navigation |
| `primary-600`             | `#294d99` | Hover state                        |
| `primary-800`             | `#182c58` | Strong text on primary surfaces    |
| `primary-900`             | `#101d3a` | Deep accents                       |

### Accent — gold

| Token                   | Hex       | Use                           |
| ----------------------- | --------- | ----------------------------- |
| `accent-100`            | `#faedbf` | Highlights                    |
| `accent-400` / `accent` | `#d9a51f` | Emphasis, small accents only  |
| `accent-600`            | `#94680a` | Accent text on light surfaces |

### Ink neutrals

| Token     | Hex       | Use                           |
| --------- | --------- | ----------------------------- |
| `ink-50`  | `#f6f6f5` | Subtle fills                  |
| `ink-100` | `#ebebea` | Navigation hover, muted fills |
| `ink-200` | `#d5d5d3` | Borders                       |
| `ink-300` | `#b3b3b0` | Strong borders, disabled text |
| `ink-500` | `#6b6b68` | Muted text                    |
| `ink-600` | `#515150` | Secondary text                |
| `ink-900` | `#141413` | Primary text                  |

### Surfaces

| Token       | Hex       | Use                         |
| ----------- | --------- | --------------------------- |
| `surface`   | `#ffffff` | Cards, forms, header        |
| `surface-1` | `#f6f7f9` | Page background             |
| `surface-2` | `#eceef2` | Secondary background blocks |

### Semantic statuses

| Status             | Light     | Default   | Dark      |
| ------------------ | --------- | --------- | --------- |
| Success / approved | `#d9f3e6` | `#1f7a52` | `#0c3d2c` |
| Warning / pending  | `#fdf0cc` | `#a86a06` | `#4d3208` |
| Danger / rejected  | `#fde8e8` | `#b8322a` | `#5c1915` |

Use the `light` surface, `DEFAULT` border, and `dark` text together for badges
and alerts.

## Radius

| Token                    | Value   | Use              |
| ------------------------ | ------- | ---------------- |
| `rounded-sm`             | 6px     | Tiny controls    |
| `rounded` / `rounded-md` | 10–12px | Buttons, inputs  |
| `rounded-lg`             | 16px    | Cards and panels |
| `rounded-xl`             | 20px    | Modals           |
| `rounded-full`           | 999px   | Badges, pills    |

## Typography

Font: **DM Sans**, with Inter and system UI fallbacks.

| Token          | Size | Use                     |
| -------------- | ---- | ----------------------- |
| `text-caption` | 11px | Metadata                |
| `text-label`   | 12px | Field labels            |
| `text-body-sm` | 13px | Dense body              |
| `text-body`    | 15px | Default body            |
| `text-body-lg` | 17px | Emphasis body           |
| `text-title`   | 20px | Page titles             |
| `text-display` | 28px | Auth and landing titles |

## CSS variables

`src/index.css` exposes the palette as CSS variables for light and `.dark`
themes. Components should prefer Tailwind tokens; CSS variables are available for
custom CSS and future dark-mode work.

## Component rules

- **Button:** primary for the main action, secondary for supporting actions,
  danger for destructive actions. Minimum height 44px, visible focus ring.
- **TextField / SelectField:** `border-ink-300`, focus on `primary`, errors in
  `danger`.
- **StatusBadge:** `warning` for pending, `success` for approved, `danger` for
  rejected, `primary` for allocated, `ink` for cancelled.
- **Cards:** `bg-surface`, `border-ink-200`, `rounded-lg`, subtle shadow.
- **Navigation:** active item uses `bg-primary text-white`; inactive items use
  `text-ink-700` with `hover:bg-ink-100`.

## Accessibility

- Body text must meet WCAG AA contrast on its surface.
- Never use colour alone to convey status; the badge also carries a label.
- Every interactive element keeps a minimum 44px target.
- Focus states are always visible; do not remove outlines without a replacement.
