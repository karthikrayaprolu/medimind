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
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: 'automatic',
  },
};

export default config;
