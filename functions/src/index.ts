import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue, type QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import * as nodemailer from 'nodemailer';

initializeApp();
const db = getFirestore();

const GMAIL_USER = defineSecret('GMAIL_USER');
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD');
const HELLOASSO_WEBHOOK_SECRET = defineSecret('HELLOASSO_WEBHOOK_SECRET');
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

// Notification HelloAsso (paiement autorisé) : l'URL est enregistrée côté
// HelloAsso (Mon Compte > Intégrations et API) avec ?key=<HELLOASSO_WEBHOOK_SECRET>
// en paramètre — faute de compte "partenaire" HelloAsso, on n'a pas accès à
// leur signature HMAC, donc ce secret dans l'URL fait office de vérification.
// On rapproche le paiement à une adhésion par e-mail (puis nom/prénom en
// repli) : HelloAsso ne nous laisse pas transmettre d'identifiant à nous.
type HelloAssoNotification = {
  eventType?: string;
  data?: {
    id?: number;
    amount?: number;
    state?: string;
    order?: { id?: number };
    payer?: { email?: string; firstName?: string; lastName?: string };
  };
};

export const helloassoWebhook = onRequest(
  { region: 'europe-west1', secrets: [HELLOASSO_WEBHOOK_SECRET] },
  async (req, res) => {
    if (req.query.key !== HELLOASSO_WEBHOOK_SECRET.value()) {
      res.status(404).send('Not found');
      return;
    }

    const body = req.body as HelloAssoNotification;
    if (body?.eventType !== 'Payment' || body?.data?.state !== 'Authorized') {
      res.status(200).send('Ignored');
      return;
    }

    const { data } = body;
    const payerEmail = data.payer?.email?.trim().toLowerCase();
    const payerNom = data.payer?.lastName?.trim().toLowerCase();
    const payerPrenom = data.payer?.firstName?.trim().toLowerCase();

    const snapshot = await db.collection('adhesions').get();
    let match: QueryDocumentSnapshot | undefined;
    for (const doc of snapshot.docs) {
      const a = doc.data();
      if (a.paiementStatut === 'paye') continue;
      if (payerEmail && a.email?.trim().toLowerCase() === payerEmail) {
        match = doc;
        break;
      }
      if (
        !match &&
        payerNom &&
        payerPrenom &&
        a.nom?.trim().toLowerCase() === payerNom &&
        a.prenom?.trim().toLowerCase() === payerPrenom
      ) {
        match = doc;
      }
    }

    if (match) {
      await match.ref.update({
        paiementStatut: 'paye',
        paiementMontant: (data.amount ?? 0) / 100,
        paiementId: data.id ?? null,
        paiementOrderId: data.order?.id ?? null,
        paiementDate: FieldValue.serverTimestamp(),
      });
    } else {
      // Aucune adhésion correspondante trouvée : on garde une trace pour
      // rapprochement manuel par l'équipe plutôt que de perdre le paiement.
      await db.collection('paiementsNonRapproches').add({
        email: data.payer?.email ?? null,
        nom: data.payer?.lastName ?? null,
        prenom: data.payer?.firstName ?? null,
        montant: (data.amount ?? 0) / 100,
        paiementId: data.id ?? null,
        orderId: data.order?.id ?? null,
        receivedAt: FieldValue.serverTimestamp(),
      });
    }

    res.status(200).send('OK');
  }
);

// Notifications push web : chaque appareil qui active les notifications
// enregistre son token FCM (déduplication naturelle via l'ID de document).
export const registerPushToken = onCall({ region: 'europe-west1' }, async (request) => {
  const token = request.data?.token;
  if (!token || typeof token !== 'string') {
    throw new HttpsError('invalid-argument', 'Token manquant.');
  }
  await db.collection('pushTokens').doc(token).set({
    token,
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { success: true };
});

// Diffusion d'une notification à tous les appareils enregistrés. Réservé aux
// admins (request.auth n'existe que pour les comptes connectés). Les tokens
// devenus invalides (désinstallation, etc.) sont nettoyés au passage.
export const sendPushNotification = onCall({ region: 'europe-west1' }, async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Réservé aux administrateurs.');
  }
  const { title, body } = request.data as { title?: string; body?: string };
  if (!title?.trim() || !body?.trim()) {
    throw new HttpsError('invalid-argument', 'Titre et message requis.');
  }

  const snapshot = await db.collection('pushTokens').get();
  const tokens = snapshot.docs.map((d) => d.id);
  if (tokens.length === 0) return { sent: 0 };

  const response = await getMessaging().sendEachForMulticast({
    tokens,
    notification: { title: title.trim(), body: body.trim() },
  });

  const invalidTokens = response.responses
    .map((r, i) => ({ r, token: tokens[i] }))
    .filter(
      ({ r }) =>
        !r.success &&
        (r.error?.code === 'messaging/registration-token-not-registered' ||
          r.error?.code === 'messaging/invalid-registration-token')
    )
    .map(({ token: t }) => t);
  await Promise.all(invalidTokens.map((t) => db.collection('pushTokens').doc(t).delete()));

  return { sent: response.successCount };
});

type InscriptionActionPayload = {
  actionId: string;
  actionTitre: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  reponses?: Record<string, string>;
};

export const submitInscriptionAction = onCall(
  { region: 'europe-west1', secrets: [GMAIL_USER, GMAIL_APP_PASSWORD] },
  async (request) => {
    const data = request.data as InscriptionActionPayload;

    if (!data?.nom?.trim() || !data?.prenom?.trim() || !data?.email?.trim() || !data?.telephone?.trim()) {
      throw new HttpsError(
        'invalid-argument',
        'Nom, prénom, e-mail et téléphone sont obligatoires.'
      );
    }

    await db.collection('inscriptionsActions').add({ ...data, createdAt: FieldValue.serverTimestamp() });

    const transporter = getTransporter(GMAIL_USER.value(), GMAIL_APP_PASSWORD.value());
    const lines = [
      `Nouvelle inscription — ${data.actionTitre}`,
      '',
      `Nom : ${data.nom}`,
      `Prénom : ${data.prenom}`,
      `E-mail : ${data.email}`,
      `Téléphone : ${data.telephone}`,
    ];
    if (data.reponses) {
      lines.push('');
      for (const [question, reponse] of Object.entries(data.reponses)) {
        lines.push(`${question} : ${reponse}`);
      }
    }

    await transporter.sendMail({
      from: `Romainville à Venir <${GMAIL_USER.value()}>`,
      to: ASSOCIATION_EMAIL,
      replyTo: data.email,
      subject: `Nouvelle inscription — ${data.actionTitre} (${data.prenom} ${data.nom})`,
      text: lines.join('\n'),
    });

    return { success: true };
  }
);
