# Dark Mode Color Pattern Analysis Report

**Generated:** December 22, 2025 **Scope:** `/apps/web/src/components/` and
`/apps/web/src/routes/`

---

## Executive Summary

The application currently uses a **dark-mode first design** with many hardcoded
dark-mode colors that lack light-mode alternatives. This analysis identifies
patterns that need updating to support proper light/dark mode theming.

### Quick Stats

- **Files Requiring Updates:** ~35 files
- **Primary Issues:** Hardcoded `bg-gray-800/900`, `text-white`,
  `text-gray-300/400`, `border-gray-600/700`
- **Files Already Themed Correctly:** ~15 files (using `dark:` prefixes or CSS
  variables)

---

## 1. Color Pattern Summary

### ✅ GOOD: Already Themed (Using dark: prefixes or CSS variables)

These files have proper light/dark mode support:

| File                                                                          | Pattern Used                                                          |
| ----------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| [footer.tsx](../apps/web/src/components/footer.tsx)                           | `bg-gray-50 dark:bg-gray-900`, `border-gray-200 dark:border-gray-700` |
| [profile-form.tsx](../apps/web/src/components/forms/profile-form.tsx)         | `text-gray-900 dark:text-white`, `bg-white dark:bg-white/5`           |
| [edit-coupon-sheet.tsx](../apps/web/src/components/edit-coupon-sheet.tsx)     | `text-gray-900 dark:text-white` on labels                             |
| [create-coupon-sheet.tsx](../apps/web/src/components/create-coupon-sheet.tsx) | Partial theming on cancel button                                      |
| [theme-toggle.tsx](../apps/web/src/components/theme-toggle.tsx)               | `hover:bg-gray-100 dark:hover:bg-gray-700`                            |
| [header.tsx](../apps/web/src/components/header.tsx) (partial)                 | Avatar: `bg-gray-50 dark:bg-gray-800`                                 |
| [nav-link.tsx](../apps/web/src/components/ui/nav-link.tsx)                    | `hover:bg-gray-100 dark:hover:bg-gray-700`                            |
| [terms.tsx](../apps/web/src/routes/terms.tsx)                                 | Full theming throughout                                               |
| [cookies.tsx](../apps/web/src/routes/cookies.tsx)                             | Full theming throughout                                               |
| [privacy.tsx](../apps/web/src/routes/privacy.tsx)                             | Full theming throughout                                               |

### ✅ GOOD: Using CSS Variables (Auto-switching)

These use Tailwind CSS variables that automatically switch:

- `bg-background`, `text-foreground`
- `bg-muted`, `text-muted-foreground`
- `bg-accent`, `text-accent-foreground`
- `border-input`

Found in: [sheet.tsx](../apps/web/src/components/ui/sheet.tsx),
[button.tsx](../apps/web/src/components/ui/button.tsx),
[input.tsx](../apps/web/src/components/ui/input.tsx),
[dropdown-menu.tsx](../apps/web/src/components/ui/dropdown-menu.tsx)

---

## 2. Color Mapping Reference

When updating files, use these mappings:

| Dark Mode Only      | →   | Light + Dark Mode                          |
| ------------------- | --- | ------------------------------------------ |
| `bg-gray-900`       | →   | `bg-white dark:bg-gray-900`                |
| `bg-gray-800`       | →   | `bg-gray-100 dark:bg-gray-800`             |
| `bg-gray-700`       | →   | `bg-gray-200 dark:bg-gray-700`             |
| `bg-gray-800/50`    | →   | `bg-gray-100/50 dark:bg-gray-800/50`       |
| `bg-gray-900/75`    | →   | `bg-white/75 dark:bg-gray-900/75`          |
| `text-white`        | →   | `text-gray-900 dark:text-white`            |
| `text-gray-200`     | →   | `text-gray-700 dark:text-gray-200`         |
| `text-gray-300`     | →   | `text-gray-600 dark:text-gray-300`         |
| `text-gray-400`     | →   | `text-gray-500 dark:text-gray-400`         |
| `border-gray-600`   | →   | `border-gray-300 dark:border-gray-600`     |
| `border-gray-700`   | →   | `border-gray-200 dark:border-gray-700`     |
| `border-gray-800`   | →   | `border-gray-100 dark:border-gray-800`     |
| `outline-gray-600`  | →   | `outline-gray-300 dark:outline-gray-600`   |
| `ring-gray-600`     | →   | `ring-gray-300 dark:ring-gray-600`         |
| `divide-gray-700`   | →   | `divide-gray-200 dark:divide-gray-700`     |
| `hover:bg-gray-700` | →   | `hover:bg-gray-200 dark:hover:bg-gray-700` |
| `hover:bg-gray-800` | →   | `hover:bg-gray-100 dark:hover:bg-gray-800` |

---

## 3. Files Requiring Updates

### 🔴 HIGH PRIORITY - Admin/User-Facing Components

#### [edit-user-sheet.tsx](../apps/web/src/components/edit-user-sheet.tsx)

**Severity:** High - Admin functionality **Issues Found:**

- `bg-gray-800` on inputs (lines 233, 263, 293, 334, 505, 537)
- `text-white` on labels (lines 226, 256, 286, 316, 356, 391, 415, 451,
  498, 527)
- `outline-gray-600` on inputs
- `text-gray-400` on help text (lines 361, 456, 532)
- `border-gray-700` on containers (lines 352, 444, 561)
- `ring-gray-600` on cancel button (line 579)
- `hover:bg-gray-800` on cancel button (line 579)

**Recommended Changes:**

```diff
- bg-gray-800 text-white outline-gray-600
+ bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white outline-gray-300 dark:outline-gray-600

- text-sm font-medium text-white
+ text-sm font-medium text-gray-900 dark:text-white

- border-gray-700
+ border-gray-200 dark:border-gray-700

- text-gray-400
+ text-gray-500 dark:text-gray-400
```

---

#### [admin/users.tsx](../apps/web/src/routes/_authenticated/admin/users.tsx)

**Severity:** High - Admin table **Issues Found:**

- `text-white` on table headers and title (lines 69, 87-105, 117)
- `text-gray-300` on description (line 72, 296)
- `text-gray-400` on table cells (lines 132, 142, 146, 159, 175, 187, 197)

**Recommended Changes:**

```diff
- text-lg font-semibold text-white
+ text-lg font-semibold text-gray-900 dark:text-white

- text-sm text-gray-300
+ text-sm text-gray-600 dark:text-gray-300

- text-gray-400
+ text-gray-500 dark:text-gray-400
```

---

#### [admin/coupons/index.tsx](../apps/web/src/routes/_authenticated/admin/coupons/index.tsx)

**Severity:** High - Admin table **Issues Found:**

- `text-white` on title and table cells (lines 62, 74, 106)
- `text-gray-300` on descriptions (lines 66, 112, 118, 124, 274)
- `text-gray-400` on dates and empty state (lines 141, 149, 179, 273)

---

#### [support/index.tsx](../apps/web/src/routes/support/index.tsx)

**Severity:** High - User-facing **Issues Found:**

- `text-white` on table headers and cells (lines 39, 76-91, 103, 114, 159)
- `text-gray-300` on descriptions (lines 42, 58, 243)
- `text-gray-400` on table cells (lines 118, 122, 126, 146, 158)

---

#### [support/$supportTicket/index.tsx](../apps/web/src/routes/support/$supportTicket/index.tsx)

**Severity:** High - User-facing **Issues Found:**

- `bg-gray-600` on buttons (line 75)
- `hover:bg-gray-700` on buttons (line 75)
- `border-gray-600` on dividers (line 136)
- `text-white` on text (line 136)

---

### 🟠 MEDIUM PRIORITY - Layout & Navigation

#### [header.tsx](../apps/web/src/components/header.tsx)

**Severity:** Medium - Main navigation **Issues Found:**

- `bg-gray-900/40`, `bg-gray-900/60` on header background (line 25)
- `bg-gray-700 text-white` on active nav items (lines 37, 49, 62, 76, 90, 420,
  435, 450, 467, 484)
- `bg-gray-700` on menus (lines 154, 315)
- `hover:bg-gray-800` on menu items (lines 156, 163, 170, 178, 207, 317, 324,
  331, 339, 368)
- `bg-gray-900` on mobile dialog (line 259)
- `border-gray-600` on separators (lines 45, 58, 86)
- `text-gray-700 dark:text-gray-200` (line 32) - partial fix

---

#### [admin-layout.tsx](../apps/web/src/components/layouts/admin-layout.tsx)

**Severity:** Medium - Admin sidebar **Issues Found:**

- `bg-gray-900` on sidebar (line 7)
- `hover:bg-gray-700` on nav items (lines 13, 23, 33, 43)
- `bg-gray-800` on active items (lines 14, 24, 34, 44)

---

#### [default-layout.tsx](../apps/web/src/components/layouts/default-layout.tsx)

**Severity:** Medium **Issues Found:**

- `bg-gray-800` on dev mode indicator (line 67)
- `text-white` on dev mode text (line 67)

---

### 🟡 LOWER PRIORITY - Chat & Messaging Components

#### [chat.tsx](../apps/web/src/routes/_authenticated/chat.tsx)

**Severity:** Medium - Chat sidebar **Issues Found:**

- `bg-gray-900` on sidebar (line 25)
- `hover:bg-gray-700` on items (line 32)
- `bg-gray-800` on active items (line 33)

---

#### [chat.$channelId.tsx](../apps/web/src/routes/_authenticated/chat.$channelId.tsx)

**Severity:** Medium - Chat view **Issues Found:**

- `bg-gray-900/75` on header (line 98)
- `bg-gray-800` on main area (line 103)

---

#### [chat-message.tsx](../apps/web/src/components/chat-message.tsx)

**Severity:** Medium **Issues Found:**

- `hover:bg-gray-900/55` on messages (line 94)
- `hover:bg-gray-700` on action buttons (lines 120, 133, 141)
- `bg-gray-800` on menu (line 130)
- `border-gray-700` on menu (line 130)
- `text-gray-200` on menu items (line 133)

---

#### [chat-message-editor.tsx](../apps/web/src/components/chat-message-editor.tsx)

**Severity:** Medium **Issues Found:**

- `border-gray-700` on container (line 147)
- `bg-gray-900` on toolbar (line 165)
- Uses `dark:bg-gray-900 dark:text-white` on editor (line 170) - partial fix

---

#### [github-message-editor.tsx](../apps/web/src/components/github-message-editor.tsx)

**Severity:** Medium **Issues Found:**

- `border-gray-700` throughout (lines 172, 174, 180, 181, 192, 193, 921)
- `bg-gray-800` on tabs and containers (lines 174, 181, 193, 921)
- `bg-gray-900` on active tab (lines 180, 192)
- `text-gray-400` on inactive tabs (lines 181, 193)

---

#### [support-comment.tsx](../apps/web/src/components/support-comment.tsx)

**Severity:** Medium **Issues Found:**

- `bg-gray-800` on container (line 55)
- `bg-gray-900` on header (lines 56, 126)
- `hover:bg-gray-700` on actions (lines 96, 108, 115)
- `border-gray-700` on menu (line 106)
- `text-gray-200` on menu items (line 108)

---

### 🟢 UI Components

#### [sheet.tsx](../apps/web/src/components/ui/sheet.tsx)

**Severity:** Low - Foundational component **Issues Found:**

- `bg-gray-800/50` on overlay (line 55)
- `bg-gray-900` on sheet content (line 77)
- `border-gray-700` on sheet borders (lines 79, 81, 83, 85)

---

#### [table.tsx](../apps/web/src/components/ui/table.tsx)

**Severity:** Medium - Used in many places **Issues Found:**

- `bg-gray-700/50` on header row (line 16)
- `bg-gray-900` on tbody (line 39)
- `bg-gray-800/50` on even rows (line 43)

---

#### [card.tsx](../apps/web/src/components/ui/card.tsx)

**Severity:** Low **Issues Found:**

- `border-gray-700` on card border (line 7)

---

### 🟢 Other Components

#### [instructor-card.tsx](../apps/web/src/components/instructor-card.tsx)

**Severity:** Low **Issues Found:**

- `border-gray-700 bg-gray-800` on card (line 7)

---

#### [education/courses/route.tsx](../apps/web/src/routes/education/courses/route.tsx)

**Severity:** Low **Issues Found:**

- `border-gray-600 bg-gray-800` on course container (lines 11, 30)

---

#### [education/courses/$course/index.tsx](../apps/web/src/routes/education/courses/$course/index.tsx)

**Severity:** Low **Issues Found:**

- `border-gray-800` on container (line 17)
- `border-gray-700 bg-gray-700` on header (line 19)
- `divide-gray-700` on content (line 27)

---

#### [education/courses/$course/route.tsx](../apps/web/src/routes/education/courses/$course/route.tsx)

**Severity:** Low **Issues Found:**

- `border-gray-700 bg-gray-800` on instructor card (line 31)

---

#### [blog/index.tsx](../apps/web/src/routes/blog/index.tsx)

**Severity:** Low **Issues Found:**

- `border-gray-700` on blog post cards (line 45)

---

#### [blog/$slug.tsx](../apps/web/src/routes/blog/$slug.tsx)

**Severity:** Low **Issues Found:**

- `border-gray-700` on divider (line 49)

---

#### [(auth)/signin.tsx](<../apps/web/src/routes/(auth)/signin.tsx>)

**Severity:** Low **Issues Found:**

- `border-gray-600` on hr (line 16)

---

#### [(auth)/signup.tsx](<../apps/web/src/routes/(auth)/signup.tsx>)

**Severity:** Low **Issues Found:**

- `border-gray-600` on hr (line 16)

---

## 4. Recommended Implementation Order

### Phase 1: Core Layout Components

1. `header.tsx` - Main navigation affects all pages
2. `admin-layout.tsx` - Admin sidebar
3. `sheet.tsx` - Used by edit/create modals
4. `table.tsx` - Used by all admin tables

### Phase 2: Admin Components

5. `edit-user-sheet.tsx`
6. `admin/users.tsx`
7. `admin/coupons/index.tsx`

### Phase 3: User-Facing Components

8. `support/index.tsx`
9. `support/$supportTicket/index.tsx`
10. `chat.tsx`, `chat.$channelId.tsx`
11. `chat-message.tsx`, `chat-message-editor.tsx`

### Phase 4: Remaining Components

12. All other components listed above

---

## 5. Testing Checklist

After updating each file, verify:

- [ ] Light mode: text is readable (dark on light)
- [ ] Dark mode: text is readable (light on dark)
- [ ] Hover states work in both modes
- [ ] Active states work in both modes
- [ ] Border contrast is sufficient in both modes
- [ ] Form inputs have proper contrast in both modes
- [ ] No accessibility issues (WCAG AA contrast ratios)

---

## 6. Notes

### Components Using Semantic Colors (No Changes Needed)

The following use CSS variables that auto-switch:

- Most shadcn/ui components: `button.tsx`, `input.tsx`, `dropdown-menu.tsx`
- Components using: `bg-background`, `text-foreground`, `border-input`, etc.

### Special Cases

- **Green/Blue accent colors** (`bg-green-600`, `bg-blue-600`) - These are
  intentional brand colors and don't need light/dark variants
- **Error colors** (`text-red-400`, `text-red-500`) - May need slight adjustment
  for contrast
- **Opacity variants** (`bg-gray-900/75`) - Follow the same mapping with opacity
  preserved
