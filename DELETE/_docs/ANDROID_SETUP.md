# Rian Android App — Setup Guide

**Last known-good PWA version:** v5.3.86
**Android wrapper:** Capacitor 8.x
**Package ID:** `com.rian.fieldlog`

## Prerequisites

1. **Android Studio** — download from https://developer.android.com/studio
2. **Node.js 18+** — already installed if you're running the dev server
3. **Java 17+** — Android Studio bundles it, or install via `winget install Microsoft.OpenJDK.17`

## Project Structure

```
TimeSheet/
├── app.html              ← the PWA (source of truth)
├── capacitor.config.ts   ← Capacitor configuration
├── package.json          ← npm deps including @capacitor/*
├── scripts/
│   └── build-www.js      ← copies web assets to www/
├── www/                   ← generated (gitignored) — web assets for Capacitor
└── android/               ← native Android project
    └── app/
        ├── build.gradle
        ├── google-services.json  ← YOU MUST ADD THIS (see below)
        └── src/main/
            ├── AndroidManifest.xml
            ├── java/com/rian/fieldlog/MainActivity.java
            ├── assets/public/     ← web assets copied by cap sync
            └── res/               ← icons, splash, styles
```

## First-Time Setup

### 1. Install dependencies
```powershell
cd C:\Users\morow\OneDrive\Vibe Code\TimeSheet
npm install
```

### 2. Get google-services.json
- Go to https://console.firebase.google.com → your project → Project Settings → General
- Scroll to "Your apps" → click "Add app" → select Android
- Package name: `com.rian.fieldlog`
- Register the app and download `google-services.json`
- Place it in `android/app/google-services.json`

### 3. Add SHA-1 fingerprint for Google Sign-In
For Google Auth to work in the native app, Firebase needs your app's signing certificate fingerprint.

**Debug key (for development):**
```powershell
# From Android Studio terminal or PowerShell:
keytool -list -v -keystore "$env:USERPROFILE\.android\debug.keystore" -alias androiddebugkey -storepass android -keypass android
```
Copy the SHA-1 fingerprint and add it in Firebase Console → Project Settings → Your Apps → Android app → Add Fingerprint.

**Release key (for Play Store):**
Generate a keystore when you're ready to publish:
```powershell
keytool -genkey -v -keystore rian-release.keystore -alias rian -keyalg RSA -keysize 2048 -validity 10000
```
Add that SHA-1 to Firebase too. **Keep the keystore file safe and NEVER commit it to git.**

### 4. Build and run
```powershell
# Copy web assets to www/
npm run build:www

# Sync to Android project
npm run cap:sync

# Open in Android Studio
npm run cap:open
```
Then in Android Studio: click **Run** (green play button) with your phone connected via USB (enable USB debugging in Developer Options).

## Development Workflow

After making changes to `app.html`:

```powershell
npm run build:www      # copy updated app to www/
npm run cap:sync       # sync to Android project
# Then Run again in Android Studio
```

Or for quick iteration:
```powershell
npm run build:www && npm run cap:sync
```

## Key Differences from PWA

| Feature | PWA | Native |
|---------|-----|--------|
| Service Worker | Active (network-first) | Skipped (IS_NATIVE flag) |
| Auth | Popup → redirect fallback | Popup (Chrome Custom Tab) |
| Updates | SW auto-update + cache clear | Rebuild + reinstall APK |
| Offline | SW cache + IndexedDB | Local assets + IndexedDB |
| Push notifications | Web Push (FCM) | Native FCM (needs plugin) |
| File access | Limited | Full (with permissions) |

## IS_NATIVE Flag

`app.html` includes a global `IS_NATIVE` constant that's true when running inside Capacitor. Currently used to:
- Skip service worker registration
- Skip SW auto-update cache wipe

Use it for any future native-specific behaviour:
```js
if (IS_NATIVE) {
  // native-only code
}
```

## Future Enhancements (not yet implemented)

- **Native push notifications** — install `@capacitor/push-notifications` and wire to existing FCM setup
- **Camera plugin** — `@capacitor/camera` for better photo capture than `<input type="file">`
- **Haptic feedback** — `@capacitor/haptics` for tap feedback on buttons
- **App updates** — OTA web asset updates without full APK rebuild (Capacitor Live Update or custom solution)
- **Biometric lock** — `capacitor-native-biometric` for app lock
- **Status bar control** — `@capacitor/status-bar` for immersive mode

## Troubleshooting

**"google-services.json not found"** — Download from Firebase Console and place in `android/app/`.

**Google Sign-In fails with "DEVELOPER_ERROR"** — SHA-1 fingerprint not registered in Firebase Console. Run the keytool command above and add the fingerprint.

**White screen on launch** — Run `npm run build:www && npm run cap:sync` to ensure web assets are copied.

**Build fails in Android Studio** — Try File → Sync Project with Gradle Files, or Invalidate Caches / Restart.
