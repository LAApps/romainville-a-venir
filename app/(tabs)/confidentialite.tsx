import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, ScreenHeader } from '../../components/ui';
import { colors, spacing, typography } from '../../lib/theme';

const SECTIONS: { title: string; paragraphs: string[] }[] = [
  {
    title: 'Responsable du traitement',
    paragraphs: [
      'L’association Romainville à Venir, représentée par son président, est responsable du traitement des données collectées via cette application.',
      'Contact : rom1ville.a.venir@gmail.com',
    ],
  },
  {
    title: 'Données collectées',
    paragraphs: [
      'Formulaire d’adhésion : nom, prénom, adresse postale, téléphone, e-mail, statut choisi, préférence de groupe de discussion.',
      'Formulaire « Une question » : nom et e-mail (facultatifs), message.',
      'Paiement d’adhésion en ligne : effectué directement sur HelloAsso, qui nous transmet l’e-mail, le nom, le prénom et le montant payé pour rapprocher le paiement de la demande d’adhésion — nous ne recevons et ne stockons aucune donnée bancaire.',
      'Notifications : si vous les activez, un identifiant technique d’appareil (aucune information personnelle) est enregistré pour vous envoyer les annonces.',
      'Espace membre (équipe de l’association) : e-mail et mot de passe gérés par Firebase Authentication, jamais stockés en clair par l’association.',
      'Aucun compte public, aucun cookie publicitaire ni traceur tiers à des fins commerciales.',
    ],
  },
  {
    title: 'Finalités',
    paragraphs: [
      'Gestion des demandes d’adhésion et de la relation avec les membres.',
      'Traitement des questions et propositions citoyennes.',
      'Envoi d’annonces aux personnes ayant activé les notifications.',
    ],
  },
  {
    title: 'Base légale',
    paragraphs: [
      'Votre consentement, donné en remplissant volontairement un formulaire ou en activant les notifications, et l’intérêt légitime de l’association à gérer ses adhérents.',
    ],
  },
  {
    title: 'Destinataires',
    paragraphs: [
      'Seule l’équipe de l’association accède à ces données. Des sous-traitants techniques y sont ponctuellement associés : Google Firebase (hébergement et base de données, Union européenne), Google/Gmail (envoi des e-mails de notification à l’association) et HelloAsso (paiement en ligne des adhésions).',
    ],
  },
  {
    title: 'Durée de conservation',
    paragraphs: [
      'Les données sont conservées le temps nécessaire à la gestion de votre adhésion ou de votre demande, dans la limite indicative de 3 ans après le dernier contact, sauf obligation légale contraire.',
    ],
  },
  {
    title: 'Vos droits',
    paragraphs: [
      'Conformément au RGPD, vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation et d’opposition sur vos données, ainsi que d’un droit à la portabilité.',
      'Pour les exercer, écrivez-nous à rom1ville.a.venir@gmail.com. Vous pouvez aussi introduire une réclamation auprès de la CNIL (cnil.fr).',
    ],
  },
  {
    title: 'Sécurité',
    paragraphs: [
      'L’accès aux données est protégé par des règles de sécurité strictes (lecture et écriture limitées à l’équipe connectée) et tous les échanges avec l’application sont chiffrés (HTTPS).',
    ],
  },
];

export default function ConfidentialiteScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Confidentialité" subtitle="Politique de protection des données (RGPD)" />
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
    marginTop: spacing(2),
  },
});
