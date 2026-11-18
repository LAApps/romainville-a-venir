export type Elu = {
  id: string;
  nom: string;
  role: string;
  photo: any;
  email: string;
};

export const ASSOCIATION_EMAIL = 'rom1ville.a.venir@gmail.com';

// Les 4 élus de l'opposition municipale portés par l'association.
export const elus: Elu[] = [
  {
    id: 'daouda-gory',
    nom: 'Daouda Gory',
    role: 'Conseiller municipal d’opposition — Tête de liste Romainville à Venir',
    photo: require('../../assets/elus/daouda_gory.png'),
    email: ASSOCIATION_EMAIL,
  },
  {
    id: 'sarah-abada',
    nom: 'Sarah Abada',
    role: 'Conseillère municipale d’opposition',
    photo: require('../../assets/elus/sarah_abada.png'),
    email: ASSOCIATION_EMAIL,
  },
  {
    id: 'amel-bennacef',
    nom: 'Amel Bennacef',
    role: 'Conseillère municipale d’opposition',
    photo: require('../../assets/elus/amel_bennacef.png'),
    email: ASSOCIATION_EMAIL,
  },
  {
    id: 'franck-benghanem',
    nom: 'Franck Benghanem',
    role: 'Conseiller municipal d’opposition',
    photo: require('../../assets/elus/franck_benghanem.png'),
    email: ASSOCIATION_EMAIL,
  },
];
