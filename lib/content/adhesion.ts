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
};

export const ASSOCIATION_IBAN = 'FR76 1027 8061 3700 0230 6180 107';
export const ASSOCIATION_BIC = 'CMCIFR2A';
export const ASSOCIATION_ADRESSE = 'Romainville à Venir — 28 Rue de la butte brachet, 93230 Romainville';
export const HELLOASSO_URL = 'https://www.helloasso.com/associations/romainville-a-venir/adhesions/adhesions-asso';

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
