---
name: design-review
description: Reviews code against the Beer O'Clock skeuomorphic design system. Use when checking UI components, styling, or design compliance.
allowed-tools: Read, Glob, Grep, Agent
---

# Design System Review

Review changed files against the Beer O'Clock design system defined in CLAUDE.md.

## How to Run

1. Run `git diff HEAD --name-only` to find changed files (filter to `.tsx` screen files)
2. Read each changed screen file
3. Check every rule below against the code
4. Report violations with file paths, line numbers, and suggested fixes

## Rules to Check

### Components (Critical)
1. **No flat buttons** — every tappable action must use `<Button>` from `src/components/Button.tsx`. Search for raw `Pressable`, `TouchableOpacity`, or `TouchableHighlight` used as buttons. Exception: list item card wrappers and small header nav icons are acceptable.
2. **No flat cards** — content containers must use `<Card>` from `src/components/Card.tsx`. Check for plain `View` elements styled as cards (with shadow, border, backgroundColor white).
3. **ScreenBackground required** — every screen's root must be wrapped in `<ScreenBackground>`. Exception: `app/index.tsx` (pour screen) uses its own dark gradient.
4. **No emoji in UI** — use icon components from `src/components/icons/` or plain text. Grep for emoji unicode ranges.

### Colors & Shadows
5. **Theme tokens only** — no hardcoded hex colors. All colors must come from `src/theme.ts` via `colors.*`. Grep for `#[0-9A-Fa-f]{3,8}` in JSX/style code and flag any not in theme.
6. **Warm shadows** — shadows must use brown-tinted `rgba(69, 26, 3, opacity)`. Flag any `rgba(0, 0, 0,` in shadow styles.
7. **Use shadow presets** — prefer `shadows.sm`, `shadows.md`, `shadows.lg` from theme over inline shadow definitions.

### Styling
8. **Border radius 8-10px** — standard UI elements should use 8-10px radius. Flag `borderRadius` values above 14 on buttons, cards, or inputs (circles and decorative elements are exceptions).
9. **Gradients for depth** — buttons and prominent surfaces should use `LinearGradient`, not flat solid backgrounds.

### Typography
10. **Font sizes from theme** — use `fontSize.*` tokens, not hardcoded numbers. Exception: very small decorative text (like label details under 12px) is acceptable.

## Report Format

```
## Design Review Results

### Violations
- **[SEVERITY] file:line** — Rule X violated: [description]. Fix: [suggestion]

### Clean Files
- file.tsx — No violations

### Summary
X violations found across Y files. Z critical, W minor.
```

Severity levels: CRITICAL (broken component rule), MEDIUM (wrong colors/shadows), LOW (minor token or radius issue).
