# Beer O'Clock — Project Guide

## Overview
Cross-platform mobile app (React Native + Expo SDK 54) that measures cooking time in "Cold Ones" — your personal beer-drinking time unit. Built on the `redesign` branch with a skeuomorphic craft aesthetic.

**Always use pnpm.** Run with `pnpm start` (tunnel mode).

## Design System

### Visual Direction: Skeuomorphic Craft
Inspired by iPod Touch era iOS — textured, tactile, warm depth. Every surface has physicality. Nothing is flat.

### Rules (MUST follow)
1. **Never use flat buttons** — all buttons must use `<Button>` from `src/components/Button.tsx` which renders gradient + gloss
2. **Never use flat cards** — all cards must use `<Card>` from `src/components/Card.tsx` which renders embossed shadow + inner highlight
3. **Always use ScreenBackground** — wrap screen content in `<ScreenBackground>` for textured cream background
4. **No emoji in UI** — use icon components from `src/components/icons/` or plain text. Emoji are placeholder only.
5. **Warm shadows only** — shadows must be brown-tinted (`rgba(69, 26, 3, opacity)`), never gray
6. **Gradients for depth** — buttons, headers, and prominent surfaces use `LinearGradient`
7. **Border radius: 8-10px** — substantial, not pill-shaped (no 14px+ radius except special cases)
8. **Inner highlight borders** — cards and raised elements get a 1px `rgba(255,255,255,0.3)` top/left border for emboss effect

### Color Tokens (`src/theme.ts`)
- **amber** `#F59E0B` — primary brand, button base
- **amberLight** `#FCD34D` — highlights, gradient tops
- **amberDark** `#D97706` — gradient bottoms, pressed states
- **brown** `#451A03` — headers, dark text, containers
- **brownMedium** `#78350F` — secondary dark surfaces
- **cream** `#FFFBEB` — background base (with texture overlay)
- **white** `#FFFFFF` — card surfaces, contrast text
- **Shadows**: Use `shadows.sm`, `shadows.md`, `shadows.lg` from theme

### Gradient Presets (`src/theme.ts`)
- `gradients.button` — amberLight → amberDark (top to bottom)
- `gradients.buttonPressed` — amberDark → amber (inverted)
- `gradients.card` — white → creamDark (subtle top-light)
- `gradients.header` — brown → brownMedium

### Typography
- Hero: 48px bold (home title)
- Heading: 28px bold
- Subheading: 20px bold
- Body: 16px regular
- Caption: 14px
- All headings use brown color on light backgrounds, amberLight on dark

### Component Library (`src/components/`)
| Component | Usage |
|-----------|-------|
| `Button` | All tappable actions. Props: `variant` (primary/secondary/danger/success), `onPress`, `title` |
| `Card` | All content containers. Props: `variant` (raised/inset), `children` |
| `ScreenBackground` | Wrap every screen's root view. Provides textured cream background |
| `GlossyIcon` | Base wrapper for recipe icons. Adds rounded square + gloss overlay |
| `SectionHeader` | Styled section titles with emboss effect |

### Recipe Icons (`src/components/icons/`)
Each icon is a React Native component rendering simple shapes with gradient fill inside a `GlossyIcon` wrapper. These replace emoji throughout the app.

### File Structure
```
CLAUDE.md                          ← you are here
src/theme.ts                       ← colors, shadows, gradients, spacing, fonts
src/components/Button.tsx           ← glossy gradient button
src/components/Card.tsx             ← embossed card
src/components/ScreenBackground.tsx ← textured background
src/components/GlossyIcon.tsx       ← icon wrapper with gloss
src/components/SectionHeader.tsx    ← styled section header
src/components/icons/               ← recipe food icons
src/data/recipes.ts                ← recipe data (references icon names)
src/utils/storage.ts               ← AsyncStorage + formatting
app/                               ← all screens (Expo Router)
```

## Development
- **Run**: `pnpm start` (uses tunnel mode)
- **Type check**: `pnpm exec tsc --noEmit`
- **Design review**: `/design-review` command checks code against this design system
- **Dedicated to**: Jim O'Connor
