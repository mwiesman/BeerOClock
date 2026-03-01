---
description: Review code changes against the Beer O'Clock skeuomorphic design system
allowed-tools: [Read, Glob, Grep, Bash]
---

# Design Review

Review the current code changes against the Beer O'Clock design system defined in CLAUDE.md.

## Instructions

1. Read `CLAUDE.md` at the project root to load the design system rules
2. Run `git diff` to see what files have changed
3. For each changed file in `app/` or `src/components/`, check for these violations:

### Violation Checks

**V1 — Flat Buttons**: Any `Pressable` or `TouchableOpacity` used directly for buttons instead of the `<Button>` component from `src/components/Button.tsx`

**V2 — Flat Cards**: Any `View` styled as a card (white background, border, border-radius) that isn't using `<Card>` from `src/components/Card.tsx`

**V3 — Missing Background**: Any screen that doesn't wrap its content in `<ScreenBackground>`

**V4 — Emoji in UI**: Any emoji characters rendered in `<Text>` components that are visible to users (emoji in comments are fine)

**V5 — Gray Shadows**: Any `shadowColor` that uses gray (`#000`, `#333`, `rgba(0,0,0,...)`) instead of warm brown (`rgba(69, 26, 3, ...)`)

**V6 — Wrong Border Radius**: Buttons or cards with `borderRadius` > 10 (should be 8-10px for the skeuomorphic style)

**V7 — Missing Gradients**: Buttons without `LinearGradient` usage

**V8 — Flat Backgrounds**: Screens using plain `backgroundColor` on their root View instead of `ScreenBackground`

4. Report findings in this format:

```
## Design Review Results

### Violations Found
- **V1** in `app/home.tsx:45` — Direct Pressable used instead of Button component
- **V5** in `app/timer.tsx:120` — Shadow uses #000 instead of warm brown

### Compliant
- app/recipes.tsx — All checks pass
- src/components/Button.tsx — Reference component, N/A

### Suggestions
- Consider adding pressed state animation to the new button at line 45
```

5. If no violations are found, congratulate the developer and confirm design compliance.
