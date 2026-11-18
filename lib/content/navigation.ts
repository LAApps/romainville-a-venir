import type { Ionicons } from '@expo/vector-icons';

export type NavItem = {
  href: string;
  label: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
};

export const rubriques: NavItem[] = [
  {
    href: '/live',
    label: 'Conseil municipal en direct',
    description: 'Suivez les séances en direct et en replay',
    icon: 'videocam',
  },
  {
    href: '/hors-les-murs',
    label: 'Hors les murs',
    description: 'Nos rencontres sur le terrain, en photos',
    icon: 'images',
  },
  {
    href: '/ateliers',
    label: 'Ateliers participatifs',
    description: 'Prochains ateliers et comptes-rendus',
    icon: 'people-circle',
  },
  {
    href: '/actions-educatives',
    label: 'Actions éducatives',
    description: 'Nos actions pour la jeunesse et les familles',
    icon: 'school',
  },
  {
    href: '/une-question',
    label: 'Une question',
    description: 'FAQ et vos propositions',
    icon: 'help-buoy',
  },
];
