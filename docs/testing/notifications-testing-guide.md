# Testing Notifications — Dev Build Guide

## Why Expo Go doesn't work

Expo Go sandboxes native modules. `expo-notifications` scheduling works partially in Expo Go (permission request is fine) but scheduled local notifications don't fire reliably, and `setNotificationHandler` has no effect. You need a dev build.

---

## Step 1 — Build a development client (one-time)

EAS is already configured. Run:

```bash
# iOS (requires Apple Developer account)
eas build --profile development --platform ios

# Android
eas build --profile development --platform android
```

Uploads to EAS cloud and builds in ~10–15 min. You'll get a download link when it finishes.

**iOS shortcut — builds locally on your Mac (no cloud, faster for iteration):**

```bash
npx expo run:ios --device
```

Requires Xcode and a physical device plugged in.

---

## Step 2 — Install on device

- **iOS**: Open the EAS build link on your phone → install via TestFlight or direct `.ipa` (device UDID must be provisioned)
- **Android**: Download the `.apk` from the EAS link → install directly

---

## Step 3 — Run the dev server

Once installed, start the local server and the dev client will connect to it:

```bash
npx expo start --dev-client
```

Scan the QR code from inside the installed dev client app.

---

## Step 4 — Test scenarios

### Daily reminder

1. Complete onboarding → grant permission → pick **Morning (8:00 AM)**
2. Change phone clock to 7:59 AM → background the app → wait 1 min
3. Notification should arrive: *"Day X — tap to check in"*
4. Tap it → app should open to home screen

### Milestone notification (7-day clean streak)

1. Tap the **History tab 5 times** → opens dev menu
2. Set dev start date to **7+ days ago** with no relapses seeded
3. Kill and reopen the app — milestone check runs on every app open
4. Notification *"7 days since your last relapse. Keep going."* should fire immediately on reopen

Repeat with 14, 30, 60 days to test other milestones.

### Permission denied path

1. Go to **Settings → your app → Notifications → toggle off**
2. Clear app data via dev menu → relaunch → complete onboarding again
3. Tap **"Allow notifications"** → system denies → *"No problem"* screen should appear
4. Tapping **Continue** finishes onboarding with no preset saved — no notifications scheduled

---

## Tips

- To speed up milestone testing without changing the phone clock, use the dev menu to set a start date far in the past with no relapses, then relaunch the app.
- Notifications only fire when the app is **backgrounded or closed** — they won't appear as banners if the app is in the foreground (by design via `shouldShowAlert: true` in `setNotificationHandler`, but iOS suppresses banners for the active app by default).
- If a notification doesn't arrive, check **Settings → Notifications → your app** to confirm banners are enabled.
