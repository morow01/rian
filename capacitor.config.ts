import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.rian.fieldlog',
  appName: 'Rian',
  webDir: 'www',
  // Load the app from the local web assets (no server needed)
  server: {
    // Custom hostname avoids https://localhost referrer which Firebase blocks
    hostname: 'app.rian.fieldlog',
    androidScheme: 'https',
    // Allow navigation to external Firebase/Google auth URLs
    allowNavigation: [
      'accounts.google.com',
      '*.firebaseapp.com',
      '*.googleapis.com',
    ],
  },
  android: {
    // Use Android WebView dark mode to match the app's theme
    backgroundColor: '#0f1e2e',
    allowMixedContent: true,
    // Append Rian identifier to WebView user-agent
    appendUserAgent: 'Rian-Android',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#1e3a8a',
      showSpinner: false,
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    Keyboard: {
      // Don't resize the webview when keyboard opens — Rian handles this itself
      resize: 'none',
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0f1e2e',
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
};

export default config;
