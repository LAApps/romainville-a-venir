import { Platform } from 'react-native';
import { app, FIREBASE_VAPID_KEY, isFirebaseConfigured } from '../firebase';
import { registerPushToken } from '../api/push';

// Les notifications push ne sont implémentées que pour le web (PWA) : pas de
// build natif pour l'instant. iOS ne les permet que si l'appli a été ajoutée
// à l'écran d'accueil (Safari 16.4+) ; Android/Chrome les permet partout.
export function isPushSupported(): boolean {
  return (
    Platform.OS === 'web' &&
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    isFirebaseConfigured
  );
}

export type PushPermissionResult = 'granted' | 'denied' | 'unsupported' | 'error';

export async function enablePushNotifications(): Promise<PushPermissionResult> {
  if (!isPushSupported() || !app) return 'unsupported';

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return 'denied';

    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const { getMessaging, getToken } = await import('firebase/messaging');
    const messaging = getMessaging(app);
    const token = await getToken(messaging, {
      vapidKey: FIREBASE_VAPID_KEY,
      serviceWorkerRegistration: registration,
    });
    if (!token) return 'error';

    await registerPushToken(token);
    return 'granted';
  } catch (e) {
    console.warn('[push] activation impossible', e);
    return 'error';
  }
}
