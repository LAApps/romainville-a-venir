import { StyleSheet, Text, View } from 'react-native';
import { ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenHeader, SectionLabel } from '../../components/ui';
import { colors, radii, spacing, typography } from '../../lib/theme';

const IPHONE_STEPS = [
  'Ouvrez Safari et allez sur romainville-a-venir.web.app',
  "Appuyez sur l'icône Partager (le carré avec une flèche vers le haut, en bas de l'écran)",
  'Faites défiler et appuyez sur "Sur l\'écran d\'accueil"',
  'Appuyez sur "Ajouter" en haut à droite',
];

const ANDROID_STEPS = [
  'Ouvrez Chrome et allez sur romainville-a-venir.web.app',
  'Appuyez sur les trois points en haut à droite',
  'Appuyez sur "Ajouter à l\'écran d\'accueil" (ou "Installer l\'application" si proposé directement)',
  'Confirmez en appuyant sur "Ajouter"',
];

export default function InstallerScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader
        title="Installer l’application"
        subtitle="Ajoutez-la sur votre écran d’accueil"
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ marginBottom: spacing(6) }}>
          <Text style={styles.introText}>
            L’application est disponible en ligne, sans passer par un store. Ajoutez-la à votre
            écran d’accueil pour l’ouvrir comme une vraie application, avec son icône RAV.
          </Text>
        </Card>

        <SectionLabel>Sur iPhone (Safari)</SectionLabel>
        <StepsCard steps={IPHONE_STEPS} icon="logo-apple" />

        <View style={{ marginTop: spacing(7) }}>
          <SectionLabel>Sur Android (Chrome)</SectionLabel>
          <StepsCard steps={ANDROID_STEPS} icon="logo-android" />
        </View>

        <Card style={{ marginTop: spacing(6), backgroundColor: colors.greyLight }}>
          <View style={styles.noteRow}>
            <Ionicons name="information-circle-outline" size={18} color={colors.navy} />
            <Text style={styles.noteText}>
              Ces étapes doivent se faire depuis le navigateur (Safari ou Chrome), pas depuis une
              autre application comme Messages ou Instagram, sinon l’option n’apparaît pas.
            </Text>
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

function StepsCard({ steps, icon }: { steps: string[]; icon: keyof typeof Ionicons.glyphMap }) {
  return (
    <Card>
      <View style={styles.cardHeader}>
        <Ionicons name={icon} size={20} color={colors.navy} />
      </View>
      {steps.map((step, i) => (
        <View key={i} style={styles.stepRow}>
          <View style={styles.stepBadge}>
            <Text style={styles.stepNumber}>{i + 1}</Text>
          </View>
          <Text style={styles.stepText}>{step}</Text>
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  introText: { fontFamily: typography.body, fontSize: 13, color: colors.ink, lineHeight: 19 },
  cardHeader: { marginBottom: spacing(3) },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(3),
    marginBottom: spacing(3),
  },
  stepBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: { fontFamily: typography.bodySemiBold, fontSize: 11.5, color: colors.white },
  stepText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
  },
  noteRow: { flexDirection: 'row', gap: spacing(2.5), alignItems: 'flex-start' },
  noteText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.navy,
    lineHeight: 17,
  },
});
