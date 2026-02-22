import { useEffect, useCallback, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isRegistered: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  fcmToken: string | null;
  registerNotifications: () => Promise<string | null>;
  error: string | null;
}

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const [isRegistered, setIsRegistered] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isSupported = Capacitor.isNativePlatform();

  const registerNotifications = useCallback(async (): Promise<string | null> => {
    // Only run on native platforms (Android/iOS)
    if (!isSupported) {
      console.log('[Push] Not on native platform, skipping push registration');
      return null;
    }

    try {
      // Check current permission status
      let permStatus = await PushNotifications.checkPermissions();
      console.log('[Push] Current permission status:', permStatus.receive);

      // Request permission if needed
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
        console.log('[Push] Permission after request:', permStatus.receive);
      }

      setPermissionStatus(permStatus.receive as 'prompt' | 'granted' | 'denied');

      if (permStatus.receive !== 'granted') {
        const errorMsg = 'Push notification permission denied';
        console.warn('[Push]', errorMsg);
        setError(errorMsg);
        return null;
      }

      // Register with FCM/APNs
      await PushNotifications.register();
      console.log('[Push] Registration initiated');

      // Return a promise that resolves with the token
      return new Promise((resolve) => {
        // Set up one-time listener for registration token
        const tokenListener = PushNotifications.addListener('registration', (token: Token) => {
          console.log('[Push] Registration successful, token:', token.value);
          setFcmToken(token.value);
          setIsRegistered(true);
          setError(null);
          resolve(token.value);
        });

        // Handle registration errors
        const errorListener = PushNotifications.addListener('registrationError', (err) => {
          console.error('[Push] Registration error:', err.error);
          setError(err.error);
          setIsRegistered(false);
          resolve(null);
        });

        // Cleanup listeners after 10 seconds if no response
        setTimeout(() => {
          tokenListener.then(l => l.remove());
          errorListener.then(l => l.remove());
        }, 10000);
      });

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to register push notifications';
      console.error('[Push] Error:', errorMsg);
      setError(errorMsg);
      return null;
    }
  }, [isSupported]);

  // Set up notification listeners on mount
  useEffect(() => {
    if (!isSupported) return;

    // Handle notification received while app is in foreground
    // Since FCM now sends data-only messages (no notification payload),
    // they arrive here silently. Local notifications handle visible alerts,
    // so we intentionally do NOT show a duplicate notification here.
    const receivedListener = PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('[Push] Data message received in foreground (suppressed — local notif handles display):', notification.data);
        // No toast or in-app alert — local notifications already handle
        // visible reminders at the scheduled time.
      }
    );

    // Handle notification action (user tapped on notification)
    const actionListener = PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('[Push] Notification action performed:', action);
        // Navigate to relevant screen based on notification data
        const data = action.notification.data;
        if (data?.screen) {
          // Handle navigation if needed
          console.log('[Push] Should navigate to:', data.screen);
        }
      }
    );

    // Check initial permission status
    PushNotifications.checkPermissions().then((status) => {
      setPermissionStatus(status.receive as 'prompt' | 'granted' | 'denied');
    });

    // Cleanup listeners on unmount
    return () => {
      receivedListener.then(l => l.remove());
      actionListener.then(l => l.remove());
    };
  }, [isSupported]);

  return {
    isSupported,
    isRegistered,
    permissionStatus,
    fcmToken,
    registerNotifications,
    error,
  };
};

export default usePushNotifications;
