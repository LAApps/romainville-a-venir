import { Linking, Platform, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { Button } from './ui';
import { colors, radii, spacing } from '../lib/theme';

export default function EventMap({
  lat,
  lng,
  adresse,
}: {
  lat: number;
  lng: number;
  adresse: string;
}) {
  const embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

  const openDirections = () => {
    Linking.openURL(directionsUrl).catch(() => Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(adresse)}`));
  };

  return (
    <View>
      <View style={styles.mapWrap}>
        {Platform.OS === 'web' ? (
          <iframe src={embedUrl} style={{ border: 0, width: '100%', height: '100%' }} loading="lazy" />
        ) : (
          <WebView source={{ uri: embedUrl }} style={{ flex: 1 }} />
        )}
      </View>
      <Button
        label="Itinéraire"
        icon="navigate-outline"
        variant="outline"
        onPress={openDirections}
        style={{ marginTop: spacing(3) }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  mapWrap: {
    height: 180,
    borderRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.greyLight,
  },
});
