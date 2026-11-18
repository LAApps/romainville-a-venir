import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AdminFAB,
  Badge,
  Card,
  EmptyState,
  IconButton,
  Input,
  ScreenHeader,
  SectionLabel,
} from '../components/ui';
import { FieldLabel, FormModal } from '../components/admin/FormModal';
import { ConfirmDialog } from '../components/admin/ConfirmDialog';
import { useAdmin } from '../lib/auth/AdminContext';
import { useCollection, type WithId } from '../lib/data/useCollection';
import type { Atelier } from '../lib/content/types';
import { colors, radii, spacing, typography } from '../lib/theme';

const demoAteliers: WithId<Atelier>[] = [
  {
    id: 'demo-1',
    titre: 'Imaginons les espaces verts du Plateau',
    date: new Date(Date.now() + 10 * 86400000).toISOString(),
    lieu: 'Maison pour tous, salle Jean Moulin',
    statut: 'a_venir',
    description: 'Un atelier pour dessiner ensemble les futurs aménagements du quartier.',
    themes: [],
    propositions: [],
  },
  {
    id: 'demo-2',
    titre: 'Atelier mobilité et stationnement',
    date: new Date(Date.now() - 20 * 86400000).toISOString(),
    lieu: 'Centre social des Marnaudes',
    statut: 'passe',
    description: 'Retour d’expérience des habitants sur la circulation dans le quartier.',
    themes: ['Stationnement résidentiel', 'Pistes cyclables', 'Sécurité aux abords des écoles'],
    propositions: [
      'Créer des zones de stationnement courte durée près des commerces',
      'Prolonger la piste cyclable vers la mairie',
    ],
  },
];

function emptyAtelier(): Atelier {
  return {
    titre: '',
    date: new Date().toISOString(),
    lieu: '',
    statut: 'a_venir',
    description: '',
    themes: [],
    propositions: [],
  };
}

export default function AteliersScreen() {
  const { isAdmin } = useAdmin();
  const { items, add, update, remove } = useCollection<Atelier>('ateliers', demoAteliers, 'date');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Atelier>(emptyAtelier());
  const [submitting, setSubmitting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const aVenir = items.filter((a) => a.statut === 'a_venir');
  const passes = items.filter((a) => a.statut === 'passe');

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyAtelier());
    setModalVisible(true);
  };

  const openEdit = (atelier: WithId<Atelier>) => {
    setEditingId(atelier.id);
    setForm(atelier);
    setModalVisible(true);
  };

  const submit = async () => {
    if (!form.titre.trim() || !form.lieu.trim()) {
      Alert.alert('Champs requis', 'Merci de renseigner au moins un titre et un lieu.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) await update(editingId, form);
      else await add(form);
      setModalVisible(false);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = () => {
    if (!editingId) return;
    setConfirmVisible(true);
  };

  const handleDelete = async () => {
    if (!editingId) return;
    setConfirmVisible(false);
    await remove(editingId);
    setModalVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Ateliers participatifs" subtitle="La parole aux habitants" />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel>Prochains ateliers</SectionLabel>
        {aVenir.length === 0 && <EmptyState text="Aucun atelier programmé pour le moment." />}
        {aVenir.map((atelier) => (
          <AtelierCard key={atelier.id} atelier={atelier} isAdmin={isAdmin} onEdit={() => openEdit(atelier)} />
        ))}

        <View style={{ marginTop: spacing(7) }}>
          <SectionLabel>Comptes-rendus</SectionLabel>
          {passes.length === 0 && <EmptyState text="Pas encore de compte-rendu publié." />}
          {passes.map((atelier) => (
            <AtelierCard key={atelier.id} atelier={atelier} isAdmin={isAdmin} onEdit={() => openEdit(atelier)} />
          ))}
        </View>
      </ScrollView>

      {isAdmin && <AdminFAB onPress={openCreate} />}

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Modifier l’atelier' : 'Nouvel atelier'}
        onClose={() => setModalVisible(false)}
        onSubmit={submit}
        onDelete={editingId ? confirmDelete : undefined}
        submitting={submitting}
      >
        <View>
          <FieldLabel>Titre</FieldLabel>
          <Input value={form.titre} onChangeText={(t) => setForm((f) => ({ ...f, titre: t }))} />
        </View>
        <View>
          <FieldLabel>Lieu</FieldLabel>
          <Input value={form.lieu} onChangeText={(t) => setForm((f) => ({ ...f, lieu: t }))} />
        </View>
        <View>
          <FieldLabel>Statut</FieldLabel>
          <View style={styles.statutRow}>
            <StatutChip
              label="À venir"
              selected={form.statut === 'a_venir'}
              onPress={() => setForm((f) => ({ ...f, statut: 'a_venir' }))}
            />
            <StatutChip
              label="Passé"
              selected={form.statut === 'passe'}
              onPress={() => setForm((f) => ({ ...f, statut: 'passe' }))}
            />
          </View>
        </View>
        <View>
          <FieldLabel>Description</FieldLabel>
          <Input
            multiline
            value={form.description}
            onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
          />
        </View>
        <View>
          <FieldLabel>Thèmes abordés (un par ligne)</FieldLabel>
          <Input
            multiline
            value={form.themes.join('\n')}
            onChangeText={(t) => setForm((f) => ({ ...f, themes: t.split('\n').filter(Boolean) }))}
            placeholder={'Sécurité\nMobilité\n...'}
          />
        </View>
        <View>
          <FieldLabel>Propositions des habitants (une par ligne)</FieldLabel>
          <Input
            multiline
            value={form.propositions.join('\n')}
            onChangeText={(t) =>
              setForm((f) => ({ ...f, propositions: t.split('\n').filter(Boolean) }))
            }
          />
        </View>
      </FormModal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Supprimer cet atelier ?"
        message="Cette action est définitive."
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

function StatutChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && { backgroundColor: colors.navy }]}>
      <Text style={[styles.chipLabel, selected && { color: colors.white }]}>{label}</Text>
    </Pressable>
  );
}

function AtelierCard({
  atelier,
  isAdmin,
  onEdit,
}: {
  atelier: WithId<Atelier>;
  isAdmin: boolean;
  onEdit: () => void;
}) {
  return (
    <Card style={{ marginBottom: spacing(3) }}>
      <View style={styles.cardHeader}>
        <Badge
          label={atelier.statut === 'a_venir' ? 'À venir' : 'Compte-rendu'}
          tone={atelier.statut === 'a_venir' ? 'coral' : 'grey'}
        />
        {isAdmin && <IconButton name="create-outline" onPress={onEdit} />}
      </View>
      <Text style={styles.titre}>{atelier.titre}</Text>
      <View style={styles.metaRow}>
        <Ionicons name="calendar-outline" size={14} color={colors.grey} />
        <Text style={styles.meta}>
          {new Date(atelier.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
        </Text>
        <Ionicons name="location-outline" size={14} color={colors.grey} style={{ marginLeft: spacing(3) }} />
        <Text style={styles.meta}>{atelier.lieu}</Text>
      </View>
      {atelier.description ? <Text style={styles.desc}>{atelier.description}</Text> : null}

      {atelier.themes.length > 0 && (
        <View style={{ marginTop: spacing(3) }}>
          <Text style={styles.subLabel}>Thèmes abordés</Text>
          <View style={styles.tagWrap}>
            {atelier.themes.map((t, i) => (
              <View key={i} style={styles.tag}>
                <Text style={styles.tagText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {atelier.propositions.length > 0 && (
        <View style={{ marginTop: spacing(3) }}>
          <Text style={styles.subLabel}>Propositions des habitants</Text>
          {atelier.propositions.map((p, i) => (
            <View key={i} style={styles.propRow}>
              <View style={styles.bullet} />
              <Text style={styles.propText}>{p}</Text>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  titre: { fontFamily: typography.bodySemiBold, fontSize: 15, color: colors.ink, marginTop: spacing(2) },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing(2) },
  meta: { fontFamily: typography.body, fontSize: 11.5, color: colors.grey, marginLeft: 4 },
  desc: { fontFamily: typography.body, fontSize: 13, color: colors.ink, marginTop: spacing(3), lineHeight: 19 },
  subLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11,
    color: colors.navy,
    textTransform: 'uppercase',
    marginBottom: spacing(2),
  },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2) },
  tag: {
    backgroundColor: colors.offWhite,
    borderRadius: radii.pill,
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
  },
  tagText: { fontFamily: typography.bodyMedium, fontSize: 11.5, color: colors.navy },
  propRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing(2), marginTop: spacing(1.5) },
  bullet: { width: 5, height: 5, borderRadius: 2.5, backgroundColor: colors.coral, marginTop: 7 },
  propText: { flex: 1, fontFamily: typography.body, fontSize: 12.5, color: colors.ink, lineHeight: 18 },
  statutRow: { flexDirection: 'row', gap: spacing(3) },
  chip: {
    paddingVertical: spacing(2.5),
    paddingHorizontal: spacing(4),
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipLabel: { fontFamily: typography.bodySemiBold, fontSize: 13, color: colors.ink },
});
