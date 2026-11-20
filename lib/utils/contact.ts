import { Linking, Platform } from 'react-native';

// react-native-web ouvre les liens mailto: avec window.open(url, '_blank'),
// que la plupart des navigateurs bloquent silencieusement pour ce schéma
// (contrairement à tel:, qu'il gère déjà via window.location). On reproduit
// donc ce même contournement pour mailto: sur le web.
export function openMailto(url: string) {
  if (Platform.OS === 'web') {
    window.location.href = url;
    return;
  }
  Linking.openURL(url);
}
