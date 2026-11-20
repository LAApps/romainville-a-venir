import { useState } from 'react';
import { Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { Button, Card, Input } from '../ui';
import { FieldLabel } from '../admin/FormModal';
import {
  ASSOCIATION_ADRESSE,
  ASSOCIATION_BIC,
  ASSOCIATION_IBAN,
  HELLOASSO_URL,
  STATUTS,
  type AdhesionData,
  type StatutAdhesion,
} from '../../lib/content/adhesion';
import { submitAdhesion } from '../../lib/api/submissions';
import { colors, radii, spacing, typography } from '../../lib/theme';

type Step = 'form' | 'paiement' | 'done';

const initialData: AdhesionData = {
  nom: '',
  prenom: '',
  adresse: '',
  telephone: '',
  email: '',
  groupeDiscussion: 'non',
  recevoirEmails: true,
  statut: 'militant',
};

export default function AdhesionForm() {
  const [step, setStep] = useState<Step>('form');
  const [data, setData] = useState<AdhesionData>(initialData);
  const [submitting, setSubmitting] = useState(false);

  const set = <K extends keyof AdhesionData>(key: K, value: AdhesionData[K]) =>
    setData((d) => ({ ...d, [key]: value }));

  const validateForm = () => {
    if (!data.nom.trim() || !data.prenom.trim()) return 'Merci de renseigner votre nom et prénom.';
    if (!data.adresse.trim()) return 'Merci de renseigner votre adresse postale.';
    if (!data.telephone.trim()) return 'Merci de renseigner votre numéro de téléphone.';
    if (!data.email.trim() || !data.email.includes('@')) return 'Merci de renseigner une adresse e-mail valide.';
    return null;
  };

  const handleNext = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Formulaire incomplet', error);
      return;
    }
    if (data.statut === 'militant') {
      await finalize(data);
      return;
    }
    setStep('paiement');
  };

  const finalize = async (payload: AdhesionData) => {
    setSubmitting(true);
    try {
      await submitAdhesion(payload);
      setData(payload);
      setStep('done');
    } catch (e) {
      Alert.alert('Erreur lors de l’envoi', String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const copyIban = async () => {
    await Clipboard.setStringAsync(ASSOCIATION_IBAN.replace(/\s/g, ''));
    Alert.alert('IBAN copié', 'Vous pouvez le coller dans votre application bancaire.');
  };

  if (step === 'done') {
    return (
      <Card style={{ alignItems: 'center', paddingVertical: spacing(8) }}>
        <Ionicons name="checkmark-circle" size={56} color={colors.success} />
        <Text style={styles.doneTitle}>Merci {data.prenom} !</Text>
        <Text style={styles.doneText}>
          {data.statut === 'militant'
            ? 'Votre adhésion a bien été enregistrée. Vous serez informé(e) de tous nos événements, manifestations et ateliers.'
            : 'Votre adhésion a bien été enregistrée. Dès réception de votre règlement, votre statut sera confirmé par l’association.'}
        </Text>
        <Button
          label="Retour à l’accueil"
          variant="outline"
          onPress={() => router.replace('/(tabs)')}
          style={{ marginTop: spacing(5) }}
        />
      </Card>
    );
  }

  if (step === 'paiement') {
    const isBienfaiteur = data.statut === 'bienfaiteur';
    return (
      <View style={{ gap: spacing(4) }}>
        <Card>
          <Text style={styles.welcomeTitle}>
            {isBienfaiteur ? 'Bienvenue parmi les membres bienfaiteurs' : 'Bienvenue parmi les membres actifs'}
          </Text>
          <Text style={styles.welcomeText}>
            Vous serez informé(e) et invité(e) à l’ensemble de nos événements et assemblées
            générales, et pourrez candidater au conseil d’administration.
          </Text>
        </Card>

        <Card>
          <FieldLabel>
            Paiement {isBienfaiteur ? 'libre (à partir de 15 €)' : 'de 15 €'}
          </FieldLabel>
          <Text style={styles.helperText}>
            Le plus simple : réglez en ligne par carte, en toute sécurité via HelloAsso.
          </Text>
          <Button
            label="Payer en ligne via HelloAsso"
            icon="card-outline"
            onPress={() => Linking.openURL(HELLOASSO_URL)}
            style={{ marginTop: spacing(3) }}
          />

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou par virement / chèque</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>IBAN</Text>
            <Text style={styles.paymentValue}>{ASSOCIATION_IBAN}</Text>
          </View>
          <View style={styles.paymentRow}>
            <Text style={styles.paymentLabel}>BIC</Text>
            <Text style={styles.paymentValue}>{ASSOCIATION_BIC}</Text>
          </View>
          <Button
            label="Copier l’IBAN"
            variant="outline"
            icon="copy-outline"
            onPress={copyIban}
            style={{ marginTop: spacing(3) }}
          />
          <Text style={styles.chequeText}>
            Par chèque à l’ordre de « ROMAINVILLE A VENIR », à envoyer à :{'\n'}
            {ASSOCIATION_ADRESSE}
          </Text>
          {isBienfaiteur && (
            <View style={{ marginTop: spacing(3) }}>
              <FieldLabel>Montant que vous souhaitez verser (facultatif)</FieldLabel>
              <Input
                keyboardType="numeric"
                placeholder="Ex : 25€"
                value={data.montantLibre ?? ''}
                onChangeText={(t) => set('montantLibre', t)}
              />
            </View>
          )}
        </Card>

        <Card>
          <FieldLabel>Souhaitez-vous faire partie du conseil d’administration ?</FieldLabel>
          <Text style={styles.helperText}>Le bureau directeur prendra contact avec vous en cas de nécessité.</Text>
          <View style={styles.choiceRow}>
            {[
              { label: 'Oui', value: true },
              { label: 'Non', value: false },
            ].map((opt) => (
              <ChoiceChip
                key={String(opt.value)}
                label={opt.label}
                selected={data.conseilAdministration === opt.value}
                onPress={() => set('conseilAdministration', opt.value)}
              />
            ))}
          </View>
        </Card>

        <Button label="Terminer mon adhésion" onPress={() => finalize(data)} loading={submitting} />
      </View>
    );
  }

  return (
    <View style={{ gap: spacing(4) }}>
      <Card>
        <FieldLabel>Nom *</FieldLabel>
        <Input value={data.nom} onChangeText={(t) => set('nom', t)} placeholder="Votre nom" />
        <View style={{ height: spacing(3) }} />
        <FieldLabel>Prénom *</FieldLabel>
        <Input value={data.prenom} onChangeText={(t) => set('prenom', t)} placeholder="Votre prénom" />
        <View style={{ height: spacing(3) }} />
        <FieldLabel>Adresse postale complète *</FieldLabel>
        <Input
          value={data.adresse}
          onChangeText={(t) => set('adresse', t)}
          placeholder="Numéro, rue, code postal, ville"
          multiline
        />
        <View style={{ height: spacing(3) }} />
        <FieldLabel>Numéro de téléphone portable *</FieldLabel>
        <Input
          value={data.telephone}
          onChangeText={(t) => set('telephone', t)}
          placeholder="06 00 00 00 00"
          keyboardType="phone-pad"
        />
        <View style={{ height: spacing(3) }} />
        <FieldLabel>Adresse e-mail *</FieldLabel>
        <Input
          value={data.email}
          onChangeText={(t) => set('email', t)}
          placeholder="vous@exemple.fr"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </Card>

      <Card>
        <FieldLabel>
          Acceptez-vous d’être intégré(e) dans un groupe de discussion pour faciliter la
          communication ? *
        </FieldLabel>
        <View style={{ gap: spacing(2), marginTop: spacing(2) }}>
          <RadioRow
            label="Oui, sur WhatsApp"
            selected={data.groupeDiscussion === 'whatsapp'}
            onPress={() => set('groupeDiscussion', 'whatsapp')}
          />
          <RadioRow
            label="Oui, sur Telegram"
            selected={data.groupeDiscussion === 'telegram'}
            onPress={() => set('groupeDiscussion', 'telegram')}
          />
          <RadioRow
            label="Non"
            selected={data.groupeDiscussion === 'non'}
            onPress={() => set('groupeDiscussion', 'non')}
          />
        </View>
      </Card>

      <Card>
        <FieldLabel>
          Acceptez-vous de recevoir des e-mails d’information concernant la vie de l’association
          et ses projets ? *
        </FieldLabel>
        <View style={styles.choiceRow}>
          <ChoiceChip
            label="Oui"
            selected={data.recevoirEmails}
            onPress={() => set('recevoirEmails', true)}
          />
          <ChoiceChip
            label="Non"
            selected={!data.recevoirEmails}
            onPress={() => set('recevoirEmails', false)}
          />
        </View>
      </Card>

      <Card>
        <FieldLabel>Vous souhaitez devenir adhérent(e) ? *</FieldLabel>
        <Text style={styles.helperText}>Sélectionnez le statut avec lequel vous souhaitez vous engager.</Text>
        <View style={{ gap: spacing(2.5), marginTop: spacing(3) }}>
          {STATUTS.map((s) => (
            <StatutOption
              key={s.value}
              label={s.label}
              description={s.description}
              selected={data.statut === s.value}
              onPress={() => set('statut', s.value as StatutAdhesion)}
            />
          ))}
        </View>
      </Card>

      <Button label="Suivant" onPress={handleNext} loading={submitting} />
    </View>
  );
}

function RadioRow({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.radioRow}>
      <View style={[styles.radioOuter, selected && { borderColor: colors.coral }]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.radioLabel}>{label}</Text>
    </Pressable>
  );
}

function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

function StatutOption({
  label,
  description,
  selected,
  onPress,
}: {
  label: string;
  description: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.statutOption, selected && styles.statutOptionSelected]}>
      <View style={[styles.radioOuter, selected && { borderColor: colors.coral }]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={{ flex: 1, marginLeft: spacing(3) }}>
        <Text style={styles.statutLabel}>{label}</Text>
        <Text style={styles.statutDescription}>{description}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  helperText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  radioRow: { flexDirection: 'row', alignItems: 'center' },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing(3),
  },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.coral },
  radioLabel: { fontFamily: typography.body, fontSize: 13.5, color: colors.ink },
  choiceRow: { flexDirection: 'row', gap: spacing(3), marginTop: spacing(3) },
  chip: {
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(5),
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipLabel: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.ink },
  chipLabelSelected: { color: colors.white },
  statutOption: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing(3.5),
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  statutOptionSelected: { borderColor: colors.coral, backgroundColor: '#FFF4F3' },
  statutLabel: { fontFamily: typography.bodySemiBold, fontSize: 13.5, color: colors.ink },
  statutDescription: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.grey,
    marginTop: 2,
    lineHeight: 16,
  },
  welcomeTitle: { fontFamily: typography.heading, fontSize: 17, color: colors.ink },
  welcomeText: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.grey,
    marginTop: spacing(2),
    lineHeight: 19,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(5),
    marginBottom: spacing(1),
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontFamily: typography.body, fontSize: 11, color: colors.grey },
  paymentRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing(2) },
  paymentLabel: { fontFamily: typography.bodyMedium, fontSize: 12.5, color: colors.grey },
  paymentValue: { fontFamily: typography.bodySemiBold, fontSize: 12.5, color: colors.ink },
  chequeText: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.grey,
    marginTop: spacing(4),
    lineHeight: 18,
  },
  doneTitle: { fontFamily: typography.heading, fontSize: 19, color: colors.ink, marginTop: spacing(4) },
  doneText: {
    fontFamily: typography.body,
    fontSize: 13.5,
    color: colors.grey,
    textAlign: 'center',
    marginTop: spacing(2),
    paddingHorizontal: spacing(4),
    lineHeight: 20,
  },
});
