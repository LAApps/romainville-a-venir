import { Image } from 'react-native';

type Props = {
  size?: number;
  variant?: 'navy' | 'white';
};

const SOURCE_ASPECT_RATIO = 1; // fichiers officiels exportés en 500x500

const logos = {
  navy: require('../assets/logo/logo-navy.png'),
  white: require('../assets/logo/logo-white.png'),
};

// Logo officiel de l'association (export Canva, fourni par l'association).
export default function Logo({ size = 72, variant = 'navy' }: Props) {
  return (
    <Image
      source={logos[variant]}
      style={{ width: size, height: size / SOURCE_ASPECT_RATIO }}
      resizeMode="contain"
    />
  );
}
