---
name: Android App (Capacitor)
description: Native Android wrapper via Capacitor. Last good PWA version v5.3.86.
type: project
---

## Last known-good PWA version: v5.3.86

This is the version before any Android/Capacitor changes were made. If the native app introduces PWA regressions, revert to this version.

## Setup (v5.3.86 → Capacitor)

**Package ID:** `com.rian.fieldlog`
**Framework:** Capacitor 8.x (wraps existing app.html in native Android shell)
**Config:** `capacitor.config.ts`
**Web dir:** `www/` (built by `scripts/build-www.js`, gitignored)
**Android project:** `android/` (committed to git, build artifacts gitignored)

### What was added/changed:
- `capacitor.config.ts` — Capacitor config with app ID, WebView settings, splash config
- `scripts/build-www.js` — copies app.html→www/index.html + static assets
- `android/` — full native Android project (Gradle, manifest, styles, colors)
- `android/app/build.gradle` — versionCode 50386, versionName "5.3.86"
- `android/app/src/main/AndroidManifest.xml` — added permissions: INTERNET, NETWORK_STATE, RECORD_AUDIO, CAMERA, STORAGE, VIBRATE, POST_NOTIFICATIONS
- `android/app/src/main/res/values/colors.xml` — Rian theme colors
- `android/app/src/main/res/values/styles.xml` — dark theme, status bar color
- `android/app/src/main/res/drawable/splash.xml` — dark splash background
- `app.html` changes:
  - Added `IS_NATIVE` constant (detects Capacitor/Rian-Android user agent)
  - SW registration skipped when IS_NATIVE
  - SW auto-update cache wipe skipped when IS_NATIVE
- `.gitignore` — added www/, android build artifacts, keystore files
- `package.json` — added scripts (build:www, cap:sync, cap:open, cap:run)

### What Rob still needs to do:
1. Install Android Studio
2. Download `google-services.json` from Firebase Console (register Android app with package `com.rian.fieldlog`)
3. Add SHA-1 debug fingerprint to Firebase for Google Sign-In
4. Run: `npm run build:www && npm run cap:sync && npm run cap:open`
5. Run on physical device from Android Studio

### Build workflow:
```
npm run build:www    # copy app.html + assets to www/
npm run cap:sync     # sync to android project
npm run cap:open     # open in Android Studio
```

### Future work:
- Native push notifications (@capacitor/push-notifications)
- Camera plugin for better photo capture
- Haptic feedback
- OTA web asset updates (skip full APK rebuild)
- App icon — currently uses Capacitor default; needs Rian icon converted to mipmap format
- Release signing keystore

## Documentation
Full setup guide: `_docs/ANDROID_SETUP.md`
