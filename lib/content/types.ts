export type Article = {
  titre: string;
  contenu: string;
  eluId?: string;
  media: { type: 'image' | 'video' | 'lien'; url: string }[];
  date: string; // ISO
};

export type Atelier = {
  titre: string;
  date: string; // ISO
  lieu: string;
  statut: 'a_venir' | 'passe';
  description: string;
  themes: string[];
  propositions: string[];
};

export type ActionEducative = {
  titre: string;
  description: string;
  publicCible: string;
  effectifMax: string;
  modalite: string;
};

export type FaqItem = {
  question: string;
  reponse: string;
};

export type GalleryPhoto = {
  imageUrl: string;
  legende: string;
};

export type NextEvent = {
  titre: string;
  date: string;
  adresse: string;
  lat: number;
  lng: number;
  description: string;
};

export type Highlight = {
  titre: string;
  description: string;
  imageUrl: string;
  destination: 'rubrique' | 'lien' | 'aucune';
  rubriqueHref?: string;
  lienExterne?: string;
};

// Publication du conseil municipal : lien externe (vidéo YouTube du replay)
// affiché avec sa vignette et visualisable directement dans l'application.
export type Publication = {
  titre: string;
  url: string;
  date: string; // ISO
};

// Document singleton contrôlant la diffusion en direct du conseil municipal.
export type LiveStatus = {
  enDirect: boolean;
  url: string;
};
