import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, EmptyState, Input, ScreenHeader } from '../../../components/ui';
import { useAdmin } from '../../../lib/auth/AdminContext';
import { useCollection, type WithId } from '../../../lib/data/useCollection';
import { STATUTS, type AdhesionData, type StatutAdhesion } from '../../../lib/content/adhesion';
import { openMailto } from '../../../lib/utils/contact';
import { colors, radii, spacing, typography } from '../../../lib/theme';

type FirestoreTimestamp = { toDate: () => Date };

type AdhesionRecord = AdhesionData & { createdAt?: FirestoreTimestamp | string };

const demoAdhesions: WithId<AdhesionRecord>[] = [
  {
    id: 'demo-1',
    nom: 'Dupont',
    prenom: 'Marie',
    adresse: '12 rue de la Mairie, 93230 Romainville',
    telephone: '0601020304',
    email: 'marie.dupont@exemple.fr',
    groupeDiscussion: 'whatsapp',
    recevoirEmails: true,
    statut: 'militant',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    nom: 'Haddad',
    prenom: 'Karim',
    adresse: '5 avenue Pasteur, 93230 Romainville',
    telephone: '0611223344',
    email: 'karim.haddad@exemple.fr',
    groupeDiscussion: 'telegram',
    recevoirEmails: true,
    statut: 'actif',
    conseilAdministration: true,
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'demo-3',
    nom: 'Lefèvre',
    prenom: 'Sophie',
    adresse: '30 rue du Plateau, 93230 Romainville',
    telephone: '0699887766',
    email: 'sophie.lefevre@exemple.fr',
    groupeDiscussion: 'non',
    recevoirEmails: false,
    statut: 'bienfaiteur',
    montantLibre: '25€',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
];

function formatDate(value?: FirestoreTimestamp | string) {
  if (!value) return '';
  const date = typeof value === 'string' ? new Date(value) : value.toDate();
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUT_TONE: Record<StatutAdhesion, 'navy' | 'coral' | 'grey'> = {
  militant: 'grey',
  actif: 'navy',
  bienfaiteur: 'coral',
};

const STATUT_LABEL: Record<StatutAdhesion, string> = {
  militant: 'Militant',
  actif: 'Membre actif',
  bienfaiteur: 'Bienfaiteur',
};

export default function AdhesionsScreen() {
  const { isAdmin } = useAdmin();
  const { items, loading } = useCollection<AdhesionRecord>('adhesions', demoAdhesions, 'createdAt');
  const [search, setSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState<StatutAdhesion | 'tous'>('tous');

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((a) => {
      if (statutFilter !== 'tous' && a.statut !== statutFilter) return false;
      if (!query) return true;
      const haystack = `${a.nom} ${a.prenom} ${a.email} ${a.adresse}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [items, search, statutFilter]);

  const counts = useMemo(() => {
    const c: Record<StatutAdhesion, number> = { militant: 0, actif: 0, bienfaiteur: 0 };
    items.forEach((a) => {
      if (a.statut in c) c[a.statut] += 1;
    });
    return c;
  }, [items]);

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
        <ScreenHeader title="Adhésions" subtitle="Réservé à l’équipe de l’association" />
        <View style={{ padding: spacing(5) }}>
          <Card style={{ alignItems: 'center', paddingVertical: spacing(8) }}>
            <Ionicons name="lock-closed-outline" size={32} color={colors.grey} />
            <Text style={styles.lockedText}>
              Connectez-vous depuis l’espace membre pour consulter les adhésions reçues.
            </Text>
            <Button
              label="Se connecter"
              variant="outline"
              onPress={() => router.push('/admin/login')}
              style={{ marginTop: spacing(4) }}
            />
          </Card>
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Adhésions" subtitle={`${items.length} adhésion${items.length > 1 ? 's' : ''} reçue${items.length > 1 ? 's' : ''}`} />
      <View style={{ paddingHorizontal: spacing(5), paddingTop: spacing(5) }}>
        <Input
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un nom, un e-mail..."
          autoCapitalize="none"
        />
        <View style={styles.filterRow}>
          <FilterChip
            label={`Tous (${items.length})`}
            selected={statutFilter === 'tous'}
            onPress={() => setStatutFilter('tous')}
          />
          {STATUTS.map((s) => (
            <FilterChip
              key={s.value}
              label={`${STATUT_LABEL[s.value]} (${counts[s.value]})`}
              selected={statutFilter === s.value}
              onPress={() => setStatutFilter(s.value)}
            />
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {!loading && filtered.length === 0 && (
          <EmptyState icon="people-outline" text="Aucune adhésion ne correspond à cette recherche." />
        )}
        {filtered.map((a) => (
          <Card key={a.id} style={{ marginBottom: spacing(3) }}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.nom}>
                  {a.prenom} {a.nom}
                </Text>
                <Text style={styles.date}>{formatDate(a.createdAt)}</Text>
              </View>
              <View style={{ alignItems: 'flex-end', gap: spacing(1.5) }}>
                <Badge label={STATUT_LABEL[a.statut]} tone={STATUT_TONE[a.statut]} />
                {a.statut !== 'militant' && (
                  <Badge
                    label={a.paiementStatut === 'paye' ? 'Payé' : 'En attente de paiement'}
                    tone={a.paiementStatut === 'paye' ? 'navy' : 'grey'}
                  />
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <Ionicons name="mail-outline" size={14} color={colors.grey} />
              <Text style={styles.infoText}>{a.email}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={14} color={colors.grey} />
              <Text style={styles.infoText}>{a.telephone}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={14} color={colors.grey} />
              <Text style={styles.infoText}>{a.adresse}</Text>
            </View>
            {a.statut === 'bienfaiteur' && a.montantLibre ? (
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={14} color={colors.grey} />
                <Text style={styles.infoText}>Montant proposé : {a.montantLibre}</Text>
              </View>
            ) : null}
            {a.paiementStatut === 'paye' && a.paiementMontant !== undefined ? (
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle-outline" size={14} color={colors.grey} />
                <Text style={styles.infoText}>Paiement reçu via HelloAsso : {a.paiementMontant} €</Text>
              </View>
            ) : null}
            {a.conseilAdministration !== undefined && (
              <View style={styles.infoRow}>
                <Ionicons name="people-outline" size={14} color={colors.grey} />
                <Text style={styles.infoText}>
                  Conseil d’administration : {a.conseilAdministration ? 'Oui' : 'Non'}
                </Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Ionicons name="chatbubbles-outline" size={14} color={colors.grey} />
              <Text style={styles.infoText}>
                Groupe de discussion :{' '}
                {a.groupeDiscussion === 'whatsapp'
                  ? 'WhatsApp'
                  : a.groupeDiscussion === 'telegram'
                    ? 'Telegram'
                    : 'Non'}
              </Text>
            </View>

            <Button
              label="Contacter par e-mail"
              variant="outline"
              icon="mail-outline"
              onPress={() => openMailto(`mailto:${a.email}`)}
              style={{ marginTop: spacing(3) }}
            />
          </Card>
        ))}
      </ScrollView>
    </View>
  );
}

function FilterChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  filterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(2),
    marginTop: spacing(3),
    marginBottom: spacing(2),
  },
  chip: {
    paddingVertical: spacing(1.5),
    paddingHorizontal: spacing(3),
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipLabel: { fontFamily: typography.bodySemiBold, fontSize: 12, color: colors.ink },
  chipLabelSelected: { color: colors.white },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing(2),
  },
  nom: { fontFamily: typography.bodySemiBold, fontSize: 15, color: colors.ink },
  date: { fontFamily: typography.body, fontSize: 11.5, color: colors.grey, marginTop: 2 },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(2.5),
  },
  infoText: { fontFamily: typography.body, fontSize: 12.5, color: colors.ink, flex: 1 },
  lockedText: {
    fontFamily: typography.body,
    fontSize: 13.5,
    color: colors.grey,
    textAlign: 'center',
    marginTop: spacing(3),
    paddingHorizontal: spacing(6),
  },
});
