# Google Play Store Deployment Guide

## Quick Answer
**Submit today: Yes** | **Live today: Possible** (review takes hours to 2 days)

---

## Step 1: Google Play Developer Account
**Time: 10-30 min** | **Difficulty: Easy** | **Cost: $25 one-time**

- Go to https://play.google.com/console
- Sign in with Google account
- Pay $25 registration fee (one-time, not yearly)
- Account is usually active immediately

---

## Step 2: Install EAS CLI
**Time: 5 min** | **Difficulty: Easy**

```bash
npm install -g eas-cli
eas login
```

---

## Step 3: Configure App for Android
**Time: 15 min** | **Difficulty: Easy**

Update `app.json`:
- `expo.android.package`: "com.yourname.ninetydaystimer"
- `expo.android.versionCode`: 1

---

## Step 4: Build Android App
**Time: 15-25 min** | **Difficulty: Easy**

```bash
eas build --platform android --profile production
```

First time: Choose "Let EAS handle" for keystore. This creates an AAB file.

---

## Step 5: Create App in Google Play Console
**Time: 20-30 min** | **Difficulty: Medium**

1. Go to https://play.google.com/console
2. Click "Create app"
3. Fill in: App name, language, app/game, free/paid
4. Complete the declarations (content guidelines, US export laws)

---

## Step 6: Prepare Store Listing
**Time: 45 min - 1.5 hours** | **Difficulty: Medium**

Required:
- **Screenshots**: Phone (min 2), optional tablet
- **Feature graphic**: 1024x500 PNG
- **App icon**: 512x512 PNG
- **Short description**: 80 chars max
- **Full description**: 4000 chars max
- **Category**: Health & Fitness
- **Privacy policy URL**: Required
- **Content rating**: Fill out questionnaire

---

## Step 7: Submit App
**Time: 10-15 min** | **Difficulty: Easy**

```bash
eas submit --platform android
```

Or manually upload the AAB file in Play Console under "Production" → "Create new release"

---

## Step 8: Complete Release
**Time: 15-20 min** | **Difficulty: Easy**

1. Select uploaded build
2. Add release notes
3. Review and roll out to Production

---

## Step 9: Wait for Review
**Time: Hours to 3 days** | **Difficulty: None**

- Usually faster than Apple (often same day for simple apps)
- First app may take longer (up to 7 days in rare cases)

---

## Total Time (Android)

| Phase | Time |
|-------|------|
| Account setup | 10-30 min |
| Build | 15-25 min |
| Store listing | 45 min - 1.5 hours |
| Submit | 15-20 min |
| Review | Hours to 3 days |

**Total hands-on work: ~2-3 hours**

---

## Android vs iOS Comparison

| | Android | iOS |
|---|---------|-----|
| Fee | $25 one-time | $99/year |
| Review time | Hours to 3 days | 1-7 days |
| Difficulty | Slightly easier | More paperwork |
