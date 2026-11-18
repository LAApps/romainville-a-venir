export type ProgrammePilier = {
  id: string;
  numero: string;
  titre: string;
  accroche: string;
  points: string[];
};

// Synthèse des engagements du mouvement, condensés à partir du programme municipal
// pour une lecture mobile (le document complet reste consultable en PDF).
export const programmePiliers: ProgrammePilier[] = [
  {
    id: 'education',
    numero: '01',
    titre: 'Éducation prioritaire',
    accroche: "L'éducation comme boussole de toutes les décisions, de 0 à 25 ans.",
    points: [
      'Un Projet Éducatif de Ville co-construit avec enseignants, parents et associations',
      'Animateurs périscolaires diplômés et formés (BAFA/BAFD), temps de préparation rémunérés',
      'Maisons de la Jeunesse : stages garantis, aide aux devoirs, insertion professionnelle',
      'Un voyage scolaire offert par cycle, réseau de mentorat 14-25 ans',
    ],
  },
  {
    id: 'proximite',
    numero: '02',
    titre: 'Chargés de proximité',
    accroche: 'Un service municipal de terrain, accessible dans chaque quartier.',
    points: [
      'Guichet d’information et d’action dans les Bas-Pays, l’Horloge, les Trois Communes et le Plateau',
      'Signalement, orientation et suivi jusqu’à la résolution des problèmes du quotidien',
      'Lancement de "Romainville Connect", l’application municipale pour tous',
    ],
  },
  {
    id: 'democratie',
    numero: '03',
    titre: 'Démocratie locale',
    accroche: 'Le pouvoir partagé, pas délégué : décider, construire, contrôler.',
    points: [
      'Référendum d’initiative citoyenne et budget participatif comme droits, pas options',
      'Permanences mobiles "Mairie Ouverte" et plateforme numérique "Romainville Participe"',
      'Jurys citoyens, marches exploratoires et ateliers de co-élaboration des projets',
      'Reconnaissance du vote blanc et de l’interpellation citoyenne',
    ],
  },
  {
    id: 'securite',
    numero: '04',
    titre: 'Sécurité & cohésion',
    accroche: 'Prévenir, apaiser, protéger — une sécurité humaine avant tout.',
    points: [
      'Renforcement de la police municipale et médiateurs de proximité formés',
      'Rencontres trimestrielles familles - police - médiateurs autour des écoles',
      'Comité local violences/harcèlement, programme "Jeunesse & Loi" dès le collège',
    ],
  },
  {
    id: 'cadre-de-vie',
    numero: '05',
    titre: 'Cadre de vie & urbanisme',
    accroche: 'Logement digne, espaces publics vivants, chantiers respectueux.',
    points: [
      'Comités de locataires et conventions d’entretien imposées aux bailleurs',
      'Brigade Verte active au quotidien, rues et espaces publics redynamisés',
      'Place du vivant : bien-être animal, ruches pédagogiques, lutte sans produits chimiques',
    ],
  },
  {
    id: 'sante',
    numero: '06',
    titre: 'Santé & inclusion',
    accroche: 'Un droit effectif à la santé, à tous les âges.',
    points: [
      'Maison Inclusion centralisée pour le handicap et l’accès aux droits',
      'Audit accessibilité de la ville en 6 mois',
      'Navettes seniors, psychologues dans chaque école, jeux annuels handisport',
    ],
  },
  {
    id: 'solidarites',
    numero: '07',
    titre: 'Solidarités',
    accroche: 'Remettre l’humain au cœur du réseau de solidarité de proximité.',
    points: [
      'Point d’accès alimentaire solidaire, circuits courts et anti-gaspillage',
      'Charte municipale anti-discrimination et service "Droits pour tous"',
      'Ateliers de français tous âges dans les centres sociaux',
    ],
  },
  {
    id: 'ecologie',
    numero: '08',
    titre: 'Transition écologique',
    accroche: 'Une écologie utile, pas punitive : respirer mieux, payer moins.',
    points: [
      'Kits énergie gratuits et guichet unique "Rénovation & Confort"',
      'Éclairage public LED intelligent, solaire citoyen sur les toits publics',
      'Plateforme "Romainville Verte" pour verdir son quotidien en 2 minutes',
    ],
  },
  {
    id: 'mobilites',
    numero: '09',
    titre: 'Mobilités durables',
    accroche: 'Romainville se déplace mieux, plus sûr et plus vert.',
    points: [
      'Pistes cyclables continues et sécurisées jusqu’aux stations de métro',
      'Navette municipale électrique gratuite aux heures de pointe',
      'Trottoirs et passages refaits pour une accessibilité à 100%',
    ],
  },
];
