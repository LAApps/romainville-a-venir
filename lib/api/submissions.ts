import { httpsCallable } from 'firebase/functions';
import { functions, isFirebaseConfigured } from '../firebase';
import type { AdhesionData } from '../content/adhesion';

export type CitizenQuestionData = {
  nom: string;
  email: string;
  message: string;
};

/**
 * Envoie une adhésion. Quand Firebase est configuré, appelle la Cloud Function
 * `submitAdhesion` (voir functions/src/index.ts) qui enregistre la demande et
 * envoie un e-mail à l'association. Sans Firebase configuré (mode démo), la
 * demande est simplement journalisée dans la console.
 */
export async function submitAdhesion(data: AdhesionData): Promise<void> {
  if (isFirebaseConfigured && functions) {
    const call = httpsCallable(functions, 'submitAdhesion');
    await call(data);
    return;
  }
  console.info('[mode démo] Adhésion reçue (non envoyée) :', data);
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export async function submitCitizenQuestion(data: CitizenQuestionData): Promise<void> {
  if (isFirebaseConfigured && functions) {
    const call = httpsCallable(functions, 'submitCitizenQuestion');
    await call(data);
    return;
  }
  console.info('[mode démo] Question reçue (non envoyée) :', data);
  await new Promise((resolve) => setTimeout(resolve, 600));
}

export type InscriptionActionData = {
  actionId: string;
  actionTitre: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  reponses?: Record<string, string>;
};

export async function submitInscriptionAction(data: InscriptionActionData): Promise<void> {
  if (isFirebaseConfigured && functions) {
    const call = httpsCallable(functions, 'submitInscriptionAction');
    await call(data);
    return;
  }
  console.info('[mode démo] Inscription reçue (non envoyée) :', data);
  await new Promise((resolve) => setTimeout(resolve, 600));
}
