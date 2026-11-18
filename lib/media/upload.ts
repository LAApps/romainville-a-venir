import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from '../firebase';

/** Ouvre la galerie et renvoie l'URI locale choisie, ou null si annulé. */
export async function pickImage(): Promise<string | null> {
  const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted) return null;
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
  });
  if (result.canceled || !result.assets?.length) return null;
  return result.assets[0].uri;
}

/**
 * Télécharge une image locale vers Firebase Storage et renvoie son URL publique.
 * En mode démo (Firebase non configuré), renvoie l'URI locale telle quelle
 * (valable pour la session en cours, pour pouvoir tester l'app sans backend).
 */
export async function uploadImage(localUri: string, path: string): Promise<string> {
  if (!isFirebaseConfigured || !storage) return localUri;
  const response = await fetch(localUri);
  const blob = await response.blob();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, blob);
  return getDownloadURL(storageRef);
}
