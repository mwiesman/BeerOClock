# Beer O'Clock

**Cooking time, measured in Cold Ones.**

Beer O'Clock is a cross-platform mobile app that translates cooking times into "Cold Ones" — your personal beer-drinking time unit. Time yourself drinking a beer, and every recipe tells you exactly how many beers that cook takes.

*"That brisket? That's about 45 Cold Ones."*

> For to Jim O

---

## Features

- **"Pour One Out" Splash** — iBeer-style accelerometer animation. Watch a beer fill up, then tilt your phone to pour one out. Liquid and foam tilt with your phone.
- **Glass Styles** — Choose pint glass, frosty mug, bottle, or can (or let it randomize each time)
- **Time a Cold One** — Stopwatch or manual entry to calibrate your personal Cold One unit
- **Recipe Library** — 10 built-in grilling recipes with cook times shown in minutes and Cold Ones
- **Step-by-Step Cook Timer** — Guided cooking with timers for each step
- **Cold One Reminders** — Get alerted every time a Cold One passes while cooking (carries across recipe steps, so the count never resets mid-cook)
- **Skeuomorphic Design** — iPod Touch era aesthetic with glossy gradient buttons, embossed cards, warm textures, and custom recipe icons (no emoji in UI)
- **Settings** — Glass style picker, reminders toggle, Pour One Out shortcut, recalibrate

## Tech Stack

- **React Native** with **Expo SDK 54** (managed workflow)
- **Expo Router** v6 for file-based navigation
- **TypeScript** throughout
- **AsyncStorage** for local data persistence
- **expo-sensors** for accelerometer (pour animation)
- **expo-linear-gradient** for skeuomorphic gradients
- **Jest 29** + **jest-expo** + **React Native Testing Library** for testing

## Getting Started

### Prerequisites

- **Node.js** 18+ (`node --version`)
- **pnpm** (`npm install -g pnpm`)
- **Expo Go** app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Install

```bash
git clone <repo-url>
cd BeerOClock
pnpm install
```

### Run

```bash
# Start with tunnel (recommended — works across any network)
pnpm start

# Start on LAN only (phone and Mac must be on same Wi-Fi)
pnpm start:lan

# Target a specific platform
pnpm run ios
pnpm run android
pnpm run web

# Run tests
pnpm test
pnpm test:watch

# Type check
pnpm exec tsc --noEmit
```

Scan the QR code with Expo Go (Android) or the Camera app (iOS).

### Troubleshooting

| Problem | Fix |
|---------|-----|
| "Project is incompatible with this version of Expo Go" | Update Expo Go from the App Store / Play Store. This app uses SDK 54. |
| Timeout connecting to dev server | Use `pnpm start` (tunnel mode) instead of LAN mode |
| Port 8081 already in use | Kill the process: `lsof -ti:8081 \| xargs kill -9` |

## Project Structure

```
app/                          # Screens (Expo Router file-based routing)
  _layout.tsx                 # Root navigation layout & header config
  index.tsx                   # "Pour One Out" splash (accelerometer pour)
  home.tsx                    # Home screen — Cold One status, navigation
  timer.tsx                   # Beer timing / calibration (stopwatch + manual)
  recipes.tsx                 # Recipe list with Cold One conversions
  recipe/[id].tsx             # Recipe detail with steps
  cook-timer.tsx              # Active cooking timer with step progression
  settings.tsx                # Glass style, reminders, dedication

src/
  components/                 # Reusable UI components
    Button.tsx                # Glossy gradient button (5 variants)
    Card.tsx                  # Embossed card (raised/inset/dark)
    ScreenBackground.tsx      # Textured cream background wrapper
    GlossyIcon.tsx            # iPod Touch-style icon container
    SectionHeader.tsx         # Styled section headers
    icons/RecipeIcons.tsx     # 10 custom recipe icons (no emoji)
  data/
    recipes.ts                # 10 built-in grilling recipes
    __tests__/recipes.test.ts # Recipe data integrity tests
  utils/
    storage.ts                # AsyncStorage helpers, formatting, Cold One math
    __tests__/storage.test.ts # Storage utility tests (27 tests)
  theme.ts                    # Colors, shadows, gradients, spacing, typography
```

## How It Works

1. **Pour One Out** — The app opens with a glass filling up. Tilt your phone to pour it out (or skip).
2. **Calibrate** — Drink a beer and time it, or enter your time manually. This sets your Cold One unit.
3. **Browse** — Check out grilling recipes. Each shows cook time in both minutes and Cold Ones.
4. **Grill** — Tap "Start Grilling" on any recipe for a step-by-step guided timer.
5. **Drink** — Cold One reminders carry across steps. If step 1 is 4 min and your Cold One is 5 min, you'll get reminded 1 min into step 2.

## Design System

The app uses a **skeuomorphic craft** aesthetic inspired by iPod Touch era iOS — textured, tactile, warm depth. Every surface has physicality.

- Glossy gradient buttons with pressed states
- Embossed cards with warm brown-tinted shadows
- Textured cream backgrounds
- Custom View-based recipe icons (no emoji in UI)
- Warm amber/brown palette inspired by craft beer labels

Full design system rules are documented in `CLAUDE.md`.

## Art & Assets

App store assets should be dropped into:

- `assets/icon.png` — App icon (1024x1024)
- `assets/splash-icon.png` — Splash screen graphic
- `assets/favicon.png` — Web favicon

## Roadmap

### v1.0 — Publish-Ready
- [ ] Fix pour liquid physics (liquid angles/sloshes toward pour side, not vertical drain)
- [ ] Fix container shape artifacts (bottle neck junction, audit all 4 containers)
- [ ] Add "Buy Me a Cold One" tip jar in Settings (IAP: $1.99 / $4.99 / $9.99)
- [ ] Configure EAS Build (`eas.json`, app icon, splash, metadata)
- [ ] Create privacy policy page
- [ ] Set up Google Play Console ($25) and submit build
- [ ] Verify/renew Apple Developer account, submit to App Store

### v1.1 — First Update
- [ ] Custom recipe creation (add/edit/delete user recipes)
- [ ] Sound effects (`expo-av`: pour, crack open, timer ding)
- [ ] Haptic feedback (`expo-haptics`: button presses, timer alerts)
- [ ] Push notifications for background cook timers (`expo-notifications`)

### v1.2+ — Growth & Monetization
- [ ] Expand to 20-25 built-in recipes with category filtering
- [ ] "Beer O'Clock Pro" cosmetic IAP: custom container skins, themes, pour sounds
- [ ] Dark mode (system preference + manual toggle)
- [ ] Ads (AdMob or direct brewery sponsorship, only if 10k+ MAU)
- [ ] Expo SDK 55 upgrade

### Future Ideas
- [ ] Cold One history / stats tracking
- [ ] Share your Cold One time (social card image)
- [ ] Smart grill / thermometer integration
- [ ] User accounts & cloud sync

### Tests (Ongoing)
- [ ] Component tests with React Native Testing Library
- [ ] Cook timer logic tests
- [ ] Navigation integration tests

## Development Notes

- Always use **pnpm** (not npm or yarn)
- Default `pnpm start` uses **tunnel mode** — required because local network connection to Expo Go times out on this setup
- Expo SDK **54** is required to match the currently installed version of Expo Go

## License

MIT
