import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenHeader } from '../../components/ui';
import { colors, spacing, typography } from '../../lib/theme';

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: 'Éditeur de l’application',
    paragraphs: [
      'Romainville à Venir — association loi 1901.',
      'Siège social : 28 rue de la Butte Brachet, 93230 Romainville.',
      'SIRET : 106 703 242 00011.',
      'Contact : rom1ville.a.venir@gmail.com',
    ],
  },
  {
    title: 'Directeur de la publication',
    paragraphs: ['Lhaj Azzouzi, président de l’association Romainville à Venir.'],
  },
  {
    title: 'Hébergement',
    paragraphs: [
      'Application web et données hébergées par Firebase (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande), sur des infrastructures Google Cloud situées dans l’Union européenne.',
    ],
  },
  {
    title: 'Propriété intellectuelle',
    paragraphs: [
      'L’ensemble des contenus de cette application (textes, logo, visuels, programme) est la propriété de l’association Romainville à Venir, sauf mention contraire. Toute reproduction sans autorisation est interdite.',
    ],
  },
  {
    title: 'Services tiers',
    paragraphs: [
      'Le paiement des adhésions est traité par HelloAsso, et le partage de contenu renvoie vers Instagram et Facebook. Ces services disposent de leurs propres conditions d’utilisation et politiques de confidentialité, indépendantes de celles de l’association.',
    ],
  },
];

export default function MentionsLegalesScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Mentions légales" />
      <ScrollView contentContainerStyle={styles.content}>
        {SECTIONS.map((section) => (
          <Card key={section.title} style={{ marginBottom: spacing(4) }}>
            <Text style={styles.heading}>{section.title}</Text>
            {section.paragraphs.map((p, i) => (
              <Text key={i} style={styles.paragraph}>
                {p}
              </Text>
            ))}
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  heading: {
    fontFamily: typography.subheading,
    fontSize: 14,
    color: colors.navy,
    marginBottom: spacing(2),
  },
  paragraph: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
    marginTop: spacing(1),
  },
});
