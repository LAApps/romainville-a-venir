import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
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

// --- Instagram carousel sync ---
// Fetches recent posts from the association's Instagram professional account
// (via the Instagram Graph API, which requires the account to be linked to a
// Facebook Page) and mirrors them into Firestore so the app can display them
// without ever handling the access token on the client.

const INSTAGRAM_ACCESS_TOKEN = defineSecret('INSTAGRAM_ACCESS_TOKEN');
const INSTAGRAM_BUSINESS_ACCOUNT_ID = defineSecret('INSTAGRAM_BUSINESS_ACCOUNT_ID');
const GRAPH_API_VERSION = 'v21.0';
const INSTAGRAM_MAX_POSTS = 12;

type InstagramMedia = {
  id: string;
  caption?: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
};

async function syncInstagramPostsToFirestore(accessToken: string, accountId: string) {
  const url =
    `https://graph.facebook.com/${GRAPH_API_VERSION}/${accountId}/media` +
    `?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp` +
    `&limit=${INSTAGRAM_MAX_POSTS}&access_token=${accessToken}`;

  const response = await fetch(url);
  const json = (await response.json()) as { data?: InstagramMedia[]; error?: { message: string } };
  if (!response.ok || !json.data) {
    throw new Error(`Instagram Graph API error: ${json.error?.message ?? response.statusText}`);
  }

  const batch = db.batch();
  const keepIds = new Set<string>();

  for (const post of json.data) {
    const imageUrl = post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url;
    if (!imageUrl) continue;
    keepIds.add(post.id);
    batch.set(db.collection('instagramPosts').doc(post.id), {
      caption: post.caption ?? '',
      imageUrl,
      permalink: post.permalink,
      mediaType: post.media_type,
      postedAt: post.timestamp,
      syncedAt: FieldValue.serverTimestamp(),
    });
  }

  // Drop posts that fell out of the latest window so the carousel stays current.
  const existing = await db.collection('instagramPosts').get();
  existing.forEach((doc) => {
    if (!keepIds.has(doc.id)) batch.delete(doc.ref);
  });

  await batch.commit();
  return keepIds.size;
}

export const syncInstagramPosts = onSchedule(
  {
    schedule: 'every 24 hours',
    region: 'europe-west1',
    secrets: [INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID],
  },
  async () => {
    await syncInstagramPostsToFirestore(
      INSTAGRAM_ACCESS_TOKEN.value(),
      INSTAGRAM_BUSINESS_ACCOUNT_ID.value()
    );
  }
);

// Manual trigger (admin-only) so the team can force a refresh without waiting
// for the daily schedule — handy right after setup or after posting.
export const syncInstagramPostsNow = onCall(
  { region: 'europe-west1', secrets: [INSTAGRAM_ACCESS_TOKEN, INSTAGRAM_BUSINESS_ACCOUNT_ID] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Connexion requise.');
    }
    const count = await syncInstagramPostsToFirestore(
      INSTAGRAM_ACCESS_TOKEN.value(),
      INSTAGRAM_BUSINESS_ACCOUNT_ID.value()
    );
    return { success: true, count };
  }
);
