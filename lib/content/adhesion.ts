export type StatutAdhesion = 'militant' | 'actif' | 'bienfaiteur';

export type AdhesionData = {
  nom: string;
  prenom: string;
  adresse: string;
  telephone: string;
  email: string;
  groupeDiscussion: 'whatsapp' | 'telegram' | 'non';
  recevoirEmails: boolean;
  statut: StatutAdhesion;
  montantLibre?: string;
  conseilAdministration?: boolean;
  // Renseigné par la Cloud Function helloassoWebhook quand le paiement
  // correspondant est détecté — absent tant que ce n'est pas le cas.
  paiementStatut?: 'paye';
  paiementMontant?: number;
};

export const ASSOCIATION_IBAN = 'FR76 1027 8061 3700 0230 6180 107';
export const ASSOCIATION_BIC = 'CMCIFR2A';
export const ASSOCIATION_ADRESSE = 'Romainville à Venir — 28 Rue de la butte brachet, 93230 Romainville';

const HELLOASSO_BASE = 'https://www.helloasso.com/associations/romainville-a-venir/adhesions/adhesions-asso';

// Identifiants de tarif HelloAsso (un par statut) : ouvrir directement
// .../montant/<id> présélectionne la bonne activité sur leur formulaire,
// au lieu de forcer l'adhérent à la rechercher une seconde fois.
export const HELLOASSO_URLS: Record<StatutAdhesion, string> = {
  militant: `${HELLOASSO_BASE}/montant/-25212991`,
  actif: `${HELLOASSO_BASE}/montant/-25212970`,
  bienfaiteur: `${HELLOASSO_BASE}/montant/-25212979`,
};

export const STATUTS: { value: StatutAdhesion; label: string; description: string }[] = [
  {
    value: 'militant',
    label: 'Militant',
    description: 'Adhésion gratuite, pour militer et rester informé.',
  },
  {
    value: 'actif',
    label: 'Membre actif — 15 €',
    description:
      'Pour participer aux assemblées générales, candidater ou intégrer les équipes dirigeantes.',
  },
  {
    value: 'bienfaiteur',
    label: 'Membre bienfaiteur — libre, à partir de 15 €',
    description: 'Contribuez selon vos moyens au développement de l’association.',
  },
];
