import { useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import * as WebBrowser from 'expo-web-browser';
import { Button, Card, ScreenHeader } from '../components/ui';
import { colors, spacing, typography } from '../lib/theme';

const CHANNEL_LIVE_URL = 'https://www.youtube.com/@villederomainville2180/live';
const CHANNEL_STREAMS_URL = 'https://www.youtube.com/@villederomainville2180/streams';

export default function LiveScreen() {
  const [loading, setLoading] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Conseil municipal" subtitle="En direct et en replay" />
      <View style={{ padding: spacing(5), paddingBottom: 0 }}>
        <Card>
          <Text style={styles.infoText}>
            Suivez les séances du conseil municipal diffusées par la ville de Romainville, et
            retrouvez les interventions de nos élus d’opposition.
          </Text>
        </Card>
      </View>
      <View style={{ flex: 1, margin: spacing(5), borderRadius: 16, overflow: 'hidden' }}>
        {Platform.OS === 'web' ? (
          <View style={styles.webFallback}>
            <Text style={styles.webFallbackText}>
              L’aperçu intégré n’est pas disponible dans le navigateur. Ouvrez la chaîne YouTube
              directement :
            </Text>
            <Button
              label="Voir sur YouTube"
              icon="logo-youtube"
              onPress={() => WebBrowser.openBrowserAsync(CHANNEL_STREAMS_URL)}
              style={{ marginTop: spacing(4) }}
            />
          </View>
        ) : (
          <>
            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator color={colors.navy} size="large" />
              </View>
            )}
            <WebView
              source={{ uri: CHANNEL_LIVE_URL }}
              onLoadEnd={() => setLoading(false)}
              allowsFullscreenVideo
              mediaPlaybackRequiresUserAction={false}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  infoText: { fontFamily: typography.body, fontSize: 13, color: colors.ink, lineHeight: 19 },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.offWhite,
    zIndex: 1,
  },
  webFallback: {
    flex: 1,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(8),
  },
  webFallbackText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.grey,
    textAlign: 'center',
  },
});
