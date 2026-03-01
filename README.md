# Beer O'Clock

**Cooking time, measured in Cold Ones.**

Beer O'Clock is a cross-platform mobile app that translates cooking times into "Cold Ones" — your personal beer-drinking time unit. Time yourself drinking a beer, and every recipe tells you exactly how many beers that cook takes.

*"That brisket? That's about 45 Cold Ones."*

> Dedicated to Jim O'Connor. This one's for you.

---

## Features

- **"Pour One Out" Splash** — Watch a beer glass fill up, then tilt your phone to pour one out before entering the app
- **Time a Cold One** — Stopwatch or manual entry to calibrate your personal Cold One unit
- **Recipe Library** — 10 built-in grilling recipes with cook times shown in minutes and Cold Ones
- **Step-by-Step Cook Timer** — Guided cooking with timers for each step
- **Cold One Reminders** — Get alerted every time a Cold One passes while cooking (carries across recipe steps, so the count never resets mid-cook)
- **Settings** — Toggle reminders on/off, recalibrate your Cold One time

## Tech Stack

- **React Native** with **Expo SDK 54** (managed workflow)
- **Expo Router** v6 for file-based navigation
- **TypeScript** throughout
- **AsyncStorage** for local data persistence
- **expo-sensors** for accelerometer (pour animation)

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
app/                        # Screens (Expo Router file-based routing)
  _layout.tsx               # Root navigation layout & header config
  index.tsx                 # "Pour One Out" splash screen (entry point)
  home.tsx                  # Home screen — Cold One status, navigation
  timer.tsx                 # Beer timing / calibration (stopwatch + manual)
  recipes.tsx               # Recipe list with Cold One conversions
  recipe/[id].tsx           # Recipe detail with steps
  cook-timer.tsx            # Active cooking timer with step progression
  settings.tsx              # Settings, reminders toggle, dedication

src/
  data/recipes.ts           # Built-in recipe data (10 grilling recipes)
  utils/storage.ts          # AsyncStorage helpers, time formatting, Cold One math
  theme.ts                  # Design tokens — colors, spacing, typography
```

## How It Works

1. **Pour One Out** — The app opens with a glass filling up. Tilt your phone to pour it out (or skip).
2. **Calibrate** — Drink a beer and time it, or enter your time manually. This sets your Cold One unit.
3. **Browse** — Check out grilling recipes. Each shows cook time in both minutes and Cold Ones.
4. **Grill** — Tap "Start Grilling" on any recipe for a step-by-step guided timer.
5. **Drink** — Cold One reminders carry across steps. If step 1 is 4 min and your Cold One is 5 min, you'll get reminded 1 min into step 2.

## Art & Assets

Currently using emoji as placeholder art. Custom artwork should be dropped into:

- `assets/icon.png` — App icon (1024x1024)
- `assets/splash-icon.png` — Splash screen graphic
- `assets/favicon.png` — Web favicon

Recipe and UI art can be added by replacing emoji references in:
- `src/data/recipes.ts` — `imageEmoji` field on each recipe (replace with image component)
- Individual screens — emoji used as decorative headers

The visual style targets a warm amber/brown palette inspired by craft beer labels (similar to Untappd's aesthetic), with a nod to the original iPod Touch era — clean, tactile, slightly skeuomorphic.

## Turning This Into a Real App (Next Steps)

### Phase 1: Polish (current)
- [ ] Replace emoji with custom pixel art / illustrations
- [ ] Add haptic feedback on button presses
- [ ] Improve pour animation with proper physics
- [ ] Add sound effects (pour, timer ding, crack open)
- [ ] Dark mode support

### Phase 2: Features
- [ ] Custom recipe creation
- [ ] Import recipes from URL
- [ ] Push notifications for background timers
- [ ] Cold One history / stats tracking
- [ ] Share your Cold One time with friends

### Phase 3: Ship to App Stores
- [ ] Create an Expo Application Services (EAS) account: `pnpm exec eas login`
- [ ] Configure EAS Build: `pnpm exec eas build:configure`
- [ ] Build for iOS: `pnpm exec eas build --platform ios`
- [ ] Build for Android: `pnpm exec eas build --platform android`
- [ ] Submit to App Store: `pnpm exec eas submit --platform ios`
- [ ] Submit to Google Play: `pnpm exec eas submit --platform android`
- [ ] Set up OTA updates: `pnpm exec eas update`

### Phase 4: Growth
- [ ] User accounts & cloud sync
- [ ] Social features / leaderboards
- [ ] Community recipe sharing
- [ ] Integration with smart grills / thermometers

## Development Notes

- Always use **pnpm** (not npm or yarn)
- Default `pnpm start` uses **tunnel mode** — required because local network connection to Expo Go times out on this setup
- Expo SDK **54** is required to match the currently installed version of Expo Go

## License

MIT
