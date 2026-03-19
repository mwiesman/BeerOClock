# Beer O'Clock Release Roadmap Design

**Date:** 2026-03-19
**Status:** Approved
**Strategy:** "Ship Fast, Iterate" — Google Play first, Apple follows

---

## v1.0 — Publish-Ready

### Pour Animation Fix
**Problem:** Liquid drains vertically like drinking through a straw instead of behaving like real liquid. Some containers (likely bottle) have visual artifacts at the neck/body junction.

**Solution:**
- Rework liquid surface rendering so it tilts at an angle proportional to phone tilt, flowing toward the pour lip
- Liquid should slosh/angle toward the pour side when tilted, creating a realistic pour visual
- Audit all 4 containers (pint, mug, bottle, can) and fix shape artifacts — specifically the neck-to-body junction on bottle
- Preserve existing: skip button, fill animation, bubble effects, 4 container types, glass style preference

### Tip Jar ("Buy Me a Cold One")
- New section in Settings screen
- In-app purchase via `expo-in-app-purchases` or `react-native-iap`
- 3 tiers:
  - "A Cold One" — $1.99
  - "A Six Pack" — $4.99
  - "A Case" — $9.99
- Simple thank-you message after purchase
- Requires IAP product setup in both Google Play Console and App Store Connect

### App Store Submission
- Configure EAS Build (`eas.json`) for both platforms
- App assets: icon (1024x1024), splash screen, screenshots
- App store metadata: description, keywords, category (Food & Drink)
- Privacy policy (required) — simple hosted page (GitHub Pages or similar)
- **Google Play first:** $25 one-time fee, ~1-2 day review
- **Apple second:** Verify/renew student developer account (may need $99/yr standard), submit after Google Play is live

---

## v1.1 — First Update

### Custom Recipe Creation
- New "Add Recipe" screen from recipes list
- Fields: name, description, cook time (minutes), category, steps (add/remove/reorder)
- Cold One conversion auto-calculated from cook time
- Stored in AsyncStorage with separate key from built-in recipes
- Icon picker from existing recipe icons + generic "custom" icon
- Edit & delete for user-created recipes; built-ins are read-only

### Sound Effects & Haptics
- `expo-haptics`: light impact (buttons), heavy impact (timer alerts), success (pour complete)
- `expo-av`: pour/liquid sound, crack-open sound, timer ding
- Respects device silent mode
- Toggle in Settings to disable sounds

### Push Notifications (Background Timers)
- `expo-notifications` for local scheduled notifications (no server)
- Schedule notifications for Cold One intervals and step completions when app backgrounded
- Cancel when user returns or stops timer
- Permission prompt on first cook timer use, not app launch

---

## v1.2+ — Growth & Monetization

### More Recipes
- Expand from 10 to 20-25 (smoking, seafood, veggie, sides)
- New recipe icons in `RecipeIcons.tsx`
- Category filtering on recipes screen

### Premium Personalization ("Beer O'Clock Pro")
- One-time IAP (~$2.99-$4.99)
- Custom container skins: craft bottles, tallboys, steins, koozies
- Theme colors: dark amber, stout dark, IPA gold
- Custom pour sounds
- Core app stays free — premium is cosmetic only
- Reuses tip jar IAP infrastructure

### Ads (Conditional)
- Only if 10k+ MAU justifies it
- `react-native-google-mobile-ads` (AdMob)
- Banner on recipes list, interstitial after cook timer completion
- "Remove Ads" IAP option
- Alternative: direct brewery sponsorship deals

### Dark Mode
- Dark color tokens in `theme.ts`
- `useColorScheme()` hook for system preference
- Manual toggle in Settings
- Skeuomorphic style adapts: darker textures, inverted gradients, warm shadows preserved

---

## Future Backlog
- Cold One history / stats tracking
- Share your Cold One time (social card image)
- Smart grill / thermometer integration
- User accounts & cloud sync
