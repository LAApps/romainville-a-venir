import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  AdminFAB,
  Button,
  Card,
  CheckboxRow,
  EmptyState,
  IconButton,
  Input,
  ScreenHeader,
} from '../../components/ui';
import { FieldLabel, FormModal } from '../../components/admin/FormModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { useAdmin } from '../../lib/auth/AdminContext';
import { useCollection, type WithId } from '../../lib/data/useCollection';
import { useHighlightSync } from '../../lib/content/useHighlightSync';
import { pickImage, uploadImage } from '../../lib/media/upload';
import type { ActionEducative } from '../../lib/content/types';
import { colors, radii, spacing, typography } from '../../lib/theme';

const demoActions: WithId<ActionEducative>[] = [
  {
    id: 'demo-1',
    titre: 'Aide aux devoirs intergénérationnelle',
    description:
      'Des bénévoles et des seniors accompagnent les collégiens dans leurs devoirs deux soirs par semaine.',
    publicCible: 'Collégiens (6e-3e)',
    effectifMax: '20 jeunes',
    modalite: 'En présentiel, centre social des Marnaudes, mardi et jeudi 17h-19h',
  },
];

function emptyAction(): ActionEducative {
  return { titre: '', description: '', publicCible: '', effectifMax: '', modalite: '' };
}

export default function ActionsEducativesScreen() {
  const { isAdmin } = useAdmin();
  const { items, add, update, remove } = useCollection<ActionEducative>('actionsEducatives', demoActions);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ActionEducative>(emptyAction());
  const [submitting, setSubmitting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [misEnAvant, setMisEnAvant] = useState(false);
  const [highlightImageUrl, setHighlightImageUrl] = useState('');
  const [pickingImage, setPickingImage] = useState(false);
  const { isFeatured, syncHighlight } = useHighlightSync();

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyAction());
    setMisEnAvant(false);
    setHighlightImageUrl('');
    setModalVisible(true);
  };

  const openEdit = (action: WithId<ActionEducative>) => {
    setEditingId(action.id);
    setForm(action);
    setMisEnAvant(isFeatured(`action-${action.id}`));
    setHighlightImageUrl('');
    setModalVisible(true);
  };

  const handlePickHighlightImage = async () => {
    const uri = await pickImage();
    if (!uri) return;
    setPickingImage(true);
    try {
      const url = await uploadImage(uri, `highlights/${Date.now()}.jpg`);
      setHighlightImageUrl(url);
    } finally {
      setPickingImage(false);
    }
  };

  const submit = async () => {
    if (!form.titre.trim() || !form.description.trim()) {
      Alert.alert('Champs requis', 'Merci de renseigner au moins un titre et une description.');
      return;
    }
    if (misEnAvant && !highlightImageUrl) {
      Alert.alert(
        'Image requise',
        'Pour mettre cette action en avant sur l’accueil, ajoutez une image ci-dessus.'
      );
      return;
    }
    setSubmitting(true);
    try {
      let id = editingId;
      if (editingId) await update(editingId, form);
      else id = await add(form);
      await syncHighlight(`action-${id}`, misEnAvant, {
        titre: form.titre,
        description: form.description.slice(0, 140),
        imageUrl: highlightImageUrl,
        rubriqueHref: '/actions-educatives',
      });
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
      <ScreenHeader title="Actions éducatives" subtitle="Pour la jeunesse et les familles" />
      <ScrollView contentContainerStyle={styles.content}>
        {items.length === 0 && <EmptyState text="Aucune action éducative publiée pour le moment." />}
        {items.map((action) => (
          <Card key={action.id} style={{ marginBottom: spacing(3) }}>
            <View style={styles.cardHeader}>
              <Text style={styles.titre}>{action.titre}</Text>
              {isAdmin && <IconButton name="create-outline" onPress={() => openEdit(action)} />}
            </View>
            <Text style={styles.desc}>{action.description}</Text>
            <View style={styles.metaGrid}>
              <MetaItem icon="people-outline" label="Public cible" value={action.publicCible} />
              <MetaItem icon="speedometer-outline" label="Effectif max." value={action.effectifMax} />
              <MetaItem icon="construct-outline" label="Modalité" value={action.modalite} />
            </View>
          </Card>
        ))}
      </ScrollView>

      {isAdmin && <AdminFAB onPress={openCreate} />}

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Modifier l’action' : 'Nouvelle action éducative'}
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
          <FieldLabel>Descriptif</FieldLabel>
          <Input
            multiline
            value={form.description}
            onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
          />
        </View>
        <View>
          <FieldLabel>Public cible</FieldLabel>
          <Input
            value={form.publicCible}
            onChangeText={(t) => setForm((f) => ({ ...f, publicCible: t }))}
            placeholder="Ex : Collégiens, parents, seniors..."
          />
        </View>
        <View>
          <FieldLabel>Effectif maximum</FieldLabel>
          <Input
            value={form.effectifMax}
            onChangeText={(t) => setForm((f) => ({ ...f, effectifMax: t }))}
            placeholder="Ex : 20 personnes"
          />
        </View>
        <View>
          <FieldLabel>Modalité d’intervention</FieldLabel>
          <Input
            multiline
            value={form.modalite}
            onChangeText={(t) => setForm((f) => ({ ...f, modalite: t }))}
            placeholder="Lieu, fréquence, horaires..."
          />
        </View>
        <CheckboxRow
          label="Mettre en avant sur l’accueil"
          checked={misEnAvant}
          onToggle={() => setMisEnAvant((v) => !v)}
        />
        {misEnAvant && (
          <View>
            <FieldLabel>Image pour la mise en avant</FieldLabel>
            {highlightImageUrl ? (
              <Image source={{ uri: highlightImageUrl }} style={styles.highlightPreview} />
            ) : null}
            <Button
              label={pickingImage ? 'Chargement...' : 'Choisir une image'}
              variant="outline"
              icon="image-outline"
              onPress={handlePickHighlightImage}
              loading={pickingImage}
            />
          </View>
        )}
      </FormModal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Supprimer cette action ?"
        message="Cette action est définitive."
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

function MetaItem({ icon, label, value }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={16} color={colors.navy} />
      <View style={{ marginLeft: spacing(2), flex: 1 }}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: spacing(2) },
  titre: { flex: 1, fontFamily: typography.bodySemiBold, fontSize: 15.5, color: colors.ink },
  desc: { fontFamily: typography.body, fontSize: 13, color: colors.ink, marginTop: spacing(2), lineHeight: 19 },
  metaGrid: { marginTop: spacing(4), gap: spacing(3) },
  metaItem: { flexDirection: 'row', alignItems: 'flex-start' },
  metaLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 10.5,
    color: colors.grey,
    textTransform: 'uppercase',
  },
  metaValue: { fontFamily: typography.body, fontSize: 13, color: colors.ink, marginTop: 1 },
  highlightPreview: {
    width: '100%',
    height: 140,
    borderRadius: radii.md,
    marginBottom: spacing(3),
    backgroundColor: colors.greyLight,
  },
});
