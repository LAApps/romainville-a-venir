import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenHeader } from '../../components/ui';
import { colors, spacing, typography } from '../../lib/theme';

const CORRECTED = [
  'Les boutons qui n’affichaient qu’une icône (retour, modifier, fermer, ajouter, case à cocher) annoncent désormais un libellé clair pour les lecteurs d’écran.',
  'Les photos (élus, articles, galerie Hors les murs, mises en avant) ont désormais une description textuelle associée.',
  'Le gris utilisé pour les textes secondaires a été légèrement foncé pour atteindre le contraste minimal recommandé (4,5:1) sur fond blanc.',
  'L’application respecte le réglage de taille de texte du système (aucun texte n’empêche l’agrandissement par l’utilisateur).',
];

const REMAINING = [
  'Le bouton principal (texte blanc sur fond corail) reste en dessous du contraste recommandé par les WCAG pour du texte normal.',
  'Aucun audit complet RGAA (grille des 106 critères) n’a été réalisé par un auditeur certifié ; les tests ont porté sur les points les plus visibles (contraste, libellés, images), pas sur une navigation exhaustive au clavier ou avec un lecteur d’écran réel.',
  'Les vidéos intégrées (YouTube) dépendent des sous-titres proposés par YouTube lui-même, non maîtrisés par l’association.',
  'Aucun mode « contraste élevé » ou « texte seul » dédié n’est proposé.',
];

export default function AccessibiliteScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Accessibilité" subtitle="Partiellement conforme" />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={{ marginBottom: spacing(4) }}>
          <Text style={styles.paragraph}>
            L’association Romainville à Venir s’engage à rendre son application accessible au
            plus grand nombre. Cette page présente les résultats d’un audit interne réalisé en
            novembre 2026, au regard des règles WCAG 2.1 (niveau AA) — l’application n’étant pas
            soumise à l’obligation légale du RGAA (réservée aux organismes publics), mais ces
            règles nous servent de référence.
          </Text>
          <Text style={[styles.paragraph, { marginTop: spacing(3) }]}>
            État de conformité : <Text style={styles.bold}>partiellement conforme</Text>, sur la
            base d’un audit interne et non d’un contrôle par un organisme certifié.
          </Text>
        </Card>

        <Card style={{ marginBottom: spacing(4) }}>
          <View style={styles.titleRow}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={styles.heading}>Ce qui a été corrigé</Text>
          </View>
          {CORRECTED.map((item, i) => (
            <Bullet key={i} text={item} />
          ))}
        </Card>

        <Card style={{ marginBottom: spacing(4) }}>
          <View style={styles.titleRow}>
            <Ionicons name="alert-circle" size={18} color={colors.coral} />
            <Text style={styles.heading}>Ce qui reste à améliorer</Text>
          </View>
          {REMAINING.map((item, i) => (
            <Bullet key={i} text={item} />
          ))}
        </Card>

        <Card>
          <Text style={styles.heading}>Signaler un problème</Text>
          <Text style={styles.paragraph}>
            Si vous rencontrez une difficulté pour accéder à un contenu ou à une fonctionnalité de
            cette application, écrivez-nous à rom1ville.a.venir@gmail.com en décrivant le problème
            rencontré : nous reviendrons vers vous et corrigerons ce qui peut l’être.
          </Text>
        </Card>
      </ScrollView>
    </View>
  );
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <View style={styles.bulletDot} />
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing(2), marginBottom: spacing(3) },
  heading: { fontFamily: typography.subheading, fontSize: 14, color: colors.navy },
  paragraph: { fontFamily: typography.body, fontSize: 13, color: colors.ink, lineHeight: 19 },
  bold: { fontFamily: typography.bodySemiBold, color: colors.ink },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing(2.5), marginTop: spacing(2.5) },
  bulletDot: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.navy, marginTop: 7 },
  bulletText: { flex: 1, fontFamily: typography.body, fontSize: 13, color: colors.ink, lineHeight: 19 },
});
