import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as nodemailer from 'nodemailer';

initializeApp();
const db = getFirestore();

const GMAIL_USER = defineSecret('GMAIL_USER');
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');
const ASSOCIATION_EMAIL = 'rom1ville.a.venir@gmail.com';

function getTransporter(user: string, pass: string) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

const STATUT_LABELS: Record<string, string> = {
  militant: 'Militant (gratuit)',
  actif: 'Membre actif (15 €)',
  bienfaiteur: 'Membre bienfaiteur (libre, à partir de 15 €)',
};

const GROUPE_LABELS: Record<string, string> = {
  whatsapp: 'Oui, sur WhatsApp',
  telegram: 'Oui, sur Telegram',
  non: 'Non',
};

type AdhesionPayload = {
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  email: string;
  groupeDiscussion: 'whatsapp' | 'telegram' | 'non';
  recevoirEmails: boolean;
  statut: 'militant' | 'actif' | 'bienfaiteur';
  montantLibre?: string;
  conseilAdministration?: boolean;
};

export const submitAdhesion = onCall(
  { region: 'europe-west1', secrets: [GMAIL_USER, GMAIL_APP_PASSWORD] },
  async (request) => {
    const data = request.data as AdhesionPayload;

    if (!data?.nom || !data?.prenom || !data?.email || !data?.statut) {
      throw new HttpsError('invalid-argument', 'Champs obligatoires manquants.');
    }

    await db.collection('adhesions').add({ ...data, createdAt: FieldValue.serverTimestamp() });

    const transporter = getTransporter(GMAIL_USER.value(), GMAIL_APP_PASSWORD.value());
    const lines = [
      `Nouvelle adhésion — ${STATUT_LABELS[data.statut] ?? data.statut}`,
      '',
      `Nom : ${data.nom}`,
      `Prénom : ${data.prenom}`,
      `Adresse : ${data.adresse}`,
      `Téléphone : ${data.telephone}`,
      `E-mail : ${data.email}`,
      `Groupe de discussion : ${GROUPE_LABELS[data.groupeDiscussion] ?? data.groupeDiscussion}`,
      `Recevoir des e-mails d'information : ${data.recevoirEmails ? 'Oui' : 'Non'}`,
      `Statut souhaité : ${STATUT_LABELS[data.statut] ?? data.statut}`,
    ];
    if (data.montantLibre) lines.push(`Montant proposé : ${data.montantLibre}`);
    if (data.conseilAdministration !== undefined) {
      lines.push(
        `Souhaite rejoindre le conseil d'administration : ${data.conseilAdministration ? 'Oui' : 'Non'}`
      );
    }

    await transporter.sendMail({
      from: `Romainville à Venir <${GMAIL_USER.value()}>`,
      to: ASSOCIATION_EMAIL,
      replyTo: data.email,
      subject: `Nouvelle adhésion — ${data.prenom} ${data.nom}`,
      text: lines.join('\n'),
    });

    return { success: true };
  }
);

type CitizenQuestionPayload = {
  nom?: string;
  email?: string;
  message: string;
};

export const submitCitizenQuestion = onCall(
  { region: 'europe-west1', secrets: [GMAIL_USER, GMAIL_APP_PASSWORD] },
  async (request) => {
    const data = request.data as CitizenQuestionPayload;

    if (!data?.message?.trim()) {
      throw new HttpsError('invalid-argument', 'Le message est vide.');
    }

    await db
      .collection('questionsCitoyens')
      .add({ ...data, createdAt: FieldValue.serverTimestamp() });

    const transporter = getTransporter(GMAIL_USER.value(), GMAIL_APP_PASSWORD.value());
    await transporter.sendMail({
      from: `Romainville à Venir <${GMAIL_USER.value()}>`,
      to: ASSOCIATION_EMAIL,
      replyTo: data.email || undefined,
      subject: `Nouvelle question / proposition — ${data.nom || 'Anonyme'}`,
      text: [
        `De : ${data.nom || 'Anonyme'}`,
        `E-mail : ${data.email || 'non renseigné'}`,
        '',
        data.message,
      ].join('\n'),
    });

    return { success: true };
  }
);
