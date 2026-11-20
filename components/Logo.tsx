import { Image } from 'react-native';

type Props = {
  size?: number;
  variant?: 'navy' | 'white';
  /** 'full' = logo complet avec le texte "Romainville À VENIR" (accueil).
   *  'mark' = monogramme seul "P/A", plus lisible en petit (en-têtes). */
  kind?: 'full' | 'mark';
};

// Logo officiel de l'association (export Canva, fourni par l'association).
// Les ratios diffèrent légèrement entre le logo complet (texte inclus) et le
// monogramme recadré : on calcule la hauteur depuis les dimensions réelles de
// chaque fichier plutôt que de supposer un carré.
const ASSETS: Record<'full' | 'mark', Record<'navy' | 'white', { source: any; ratio: number }>> = {
  full: {
    navy: { source: require('../assets/logo/logo-navy.png'), ratio: 1 },
    white: { source: require('../assets/logo/logo-white.png'), ratio: 1 },
  },
  mark: {
    navy: { source: require('../assets/logo/mark-navy.png'), ratio: 775 / 316 },
    white: { source: require('../assets/logo/mark-white.png'), ratio: 775 / 316 },
  },
};

export default function Logo({ size = 72, variant = 'navy', kind = 'full' }: Props) {
  const { source, ratio } = ASSETS[kind][variant];
  return (
    <Image
      source={source}
      style={{ width: size, height: size / ratio }}
      resizeMode="contain"
    />
  );
}
