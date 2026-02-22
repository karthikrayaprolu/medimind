import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.medimind.app',
  appName: 'MediMind',
  webDir: 'dist',
  server: {
    // For development on Android emulator, use 10.0.2.2 to access host machine
    // For physical device, use your computer's IP address
    androidScheme: 'https',
    cleartext: true, // Allow HTTP for development
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert'],
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
    SplashScreen: {
      launchAutoHide: false,       // we hide it manually after React mounts
      backgroundColor: '#FFF9F5',
      androidScaleType: 'CENTER_CROP',
    },
  },
  android: {
    allowMixedContent: true,
    // Lock initial scale so the WebView doesn't auto-zoom based on DPI
    initialFocus: false,
    appendUserAgent: 'MediMind/1.0',
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
