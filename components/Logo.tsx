import { Image } from 'react-native';

type Props = {
  size?: number;
  variant?: 'navy' | 'white';
};

// Logo officiel de l'association (export Canva, fourni par l'association).
const ASSETS: Record<'navy' | 'white', any> = {
  navy: require('../assets/logo/logo-navy.png'),
  white: require('../assets/logo/logo-white.png'),
};

export default function Logo({ size = 72, variant = 'navy' }: Props) {
  return <Image source={ASSETS[variant]} style={{ width: size, height: size }} resizeMode="contain" />;
}
