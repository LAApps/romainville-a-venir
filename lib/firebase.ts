import Constants from 'expo-constants';
import { type FirebaseApp, getApps, initializeApp } from 'firebase/app';
import { type Auth, getAuth } from 'firebase/auth';
import { type Functions, getFunctions } from 'firebase/functions';
import { type Firestore, getFirestore } from 'firebase/firestore';
import { type FirebaseStorage, getStorage } from 'firebase/storage';

// Toutes les clés ci-dessous viennent du projet Firebase de l'association.
// Voir le README ("Configurer Firebase") pour les récupérer et les placer dans `.env`.
const extra = Constants.expoConfig?.extra ?? {};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? extra.firebaseApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? extra.firebaseAuthDomain,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? extra.firebaseProjectId,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? extra.firebaseStorageBucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? extra.firebaseMessagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? extra.firebaseAppId,
};

export const FIREBASE_VAPID_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_VAPID_KEY ?? extra.firebaseVapidKey;

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;
let db: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let functions: Functions | undefined;

if (isFirebaseConfigured) {
  app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
  functions = getFunctions(app, 'europe-west1');
} else if (__DEV__) {
  console.warn(
    '[firebase] Configuration manquante — renseignez .env (voir .env.example). ' +
      "L'application tourne en mode démo avec du contenu local uniquement."
  );
}

export { app, auth, db, storage, functions };
