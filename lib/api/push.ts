import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '../firebase';

export async function registerPushToken(token: string): Promise<void> {
  if (isFirebaseConfigured && functions) {
    const call = httpsCallable(functions, 'registerPushToken');
    await call({ token });
    return;
  }
  console.info('[mode démo] Token push reçu (non enregistré) :', token);
}

export async function sendPushNotification(title: string, body: string): Promise<{ sent: number }> {
  if (isFirebaseConfigured && functions) {
    const call = httpsCallable<{ title: string; body: string }, { sent: number }>(
      functions,
      'sendPushNotification'
    );
    const result = await call({ title, body });
    return result.data;
  }
  console.info('[mode démo] Notification non envoyée :', title, body);
  return { sent: 0 };
}
