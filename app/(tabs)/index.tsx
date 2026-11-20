import { useState } from 'react';
import { Link } from 'expo-router';
import { Alert, Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import HighlightsCarousel from '../../components/HighlightsCarousel';
import { Button, Card, Input, SectionLabel } from '../../components/ui';
import { FieldLabel, FormModal } from '../../components/admin/FormModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { allDestinations, rubriques } from '../../lib/content/navigation';
import { useAdmin } from '../../lib/auth/AdminContext';
import { useCollection, type WithId } from '../../lib/data/useCollection';
import type { Highlight } from '../../lib/content/types';
import { pickImage, uploadImage } from '../../lib/media/upload';
import { FACEBOOK_URL, INSTAGRAM_URL } from '../../lib/content/social';
import { colors, radii, shadow, spacing, typography } from '../../lib/theme';

const demoHighlights: WithId<Highlight>[] = [
  {
    id: 'demo-1',
    titre: 'Prochain atelier participatif',
    description: 'Venez donner votre avis sur les espaces verts du Plateau',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=700',
    destination: 'rubrique',
    rubriqueHref: '/ateliers',
  },
  {
    id: 'demo-2',
    titre: 'Rejoignez l’association',
    description: 'Militant, membre actif ou bienfaiteur',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=700',
    destination: 'rubrique',
    rubriqueHref: '/(tabs)/adhesion',
  },
];

function emptyHighlight(): Highlight {
  return { titre: '', description: '', imageUrl: '', destination: 'aucune' };
}

export default function HomeScreen() {
  const { isAdmin } = useAdmin();
  const { items: highlights, add, update, remove } = useCollection<Highlight>(
    'highlights',
    demoHighlights
  );

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Highlight>(emptyHighlight());
  const [submitting, setSubmitting] = useState(false);
  const [picking, setPicking] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyHighlight());
    setModalVisible(true);
  };

  const openEdit = (highlight: WithId<Highlight>) => {
    setEditingId(highlight.id);
    setForm(highlight);
    setModalVisible(true);
  };

  const handlePickImage = async () => {
    const uri = await pickImage();
    if (!uri) return;
    setPicking(true);
    try {
      const url = await uploadImage(uri, `highlights/${Date.now()}.jpg`);
      setForm((f) => ({ ...f, imageUrl: url }));
    } finally {
      setPicking(false);
    }
  };

  const submit = async () => {
    if (!form.titre.trim() || !form.imageUrl) {
      Alert.alert('Champs requis', 'Merci d’ajouter au moins un titre et une image.');
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

  const confirmDelete = () => setConfirmVisible(true);

  const handleDelete = async () => {
    if (!editingId) return;
    setConfirmVisible(false);
    await remove(editingId);
    setModalVisible(false);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing(12) }}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroTop}>
            <Logo size={64} variant="white" />
          </View>
          <Text style={styles.heroTitle}>L’association citoyenne</Text>
          <Text style={styles.heroText}>
            Informer, rassembler, agir avec vous — suivez l’action de nos 4 élus d’opposition
            et de l’association au quotidien.
          </Text>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        {(highlights.length > 0 || isAdmin) && (
          <View style={{ marginBottom: spacing(6) }}>
            <HighlightsCarousel highlights={highlights} isAdmin={isAdmin} onEdit={openEdit} />
            {isAdmin && (
              <Button
                label="Ajouter une mise en avant"
                variant="outline"
                icon="star-outline"
                onPress={openCreate}
                style={{ marginTop: spacing(3) }}
              />
            )}
          </View>
        )}

        <Link href="/(tabs)/programme" asChild>
          <Pressable>
            <Card style={styles.programmeCard}>
              <Ionicons name="document-text" size={26} color={colors.navy} />
              <View style={{ flex: 1, marginLeft: spacing(3) }}>
                <Text style={styles.programmeTitle}>Notre programme</Text>
                <Text style={styles.programmeSub}>9 engagements pour Romainville</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.grey} />
            </Card>
          </Pressable>
        </Link>

        <View style={{ marginTop: spacing(6) }}>
          <SectionLabel>Nos rubriques</SectionLabel>
          <View style={styles.grid}>
            {rubriques.map((item) => (
              <Link key={item.href} href={item.href as never} asChild>
                <Pressable style={styles.gridItem}>
                  <View style={styles.gridIcon}>
                    <Ionicons name={item.icon} size={24} color={colors.navy} />
                  </View>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                  <Text style={styles.gridDesc}>{item.description}</Text>
                </Pressable>
              </Link>
            ))}
            <Link href="/(tabs)/elus" asChild>
              <Pressable style={styles.gridItem}>
                <View style={styles.gridIcon}>
                  <Ionicons name="people" size={24} color={colors.navy} />
                </View>
                <Text style={styles.gridLabel}>Le coin des élus</Text>
                <Text style={styles.gridDesc}>Nos 4 élus et leurs actions</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={{ marginTop: spacing(7) }}>
          <SectionLabel>Suivez-nous</SectionLabel>
          <View style={styles.socialRow}>
            <Pressable style={{ flex: 1 }} onPress={() => Linking.openURL(INSTAGRAM_URL)}>
              <LinearGradient
                colors={['#FEDA77', '#DD2A7B', '#8134AF', '#515BD4']}
                start={{ x: 0, y: 1 }}
                end={{ x: 1, y: 0 }}
                style={styles.instagramBtn}
              >
                <Ionicons name="logo-instagram" size={20} color={colors.white} />
                <Text style={styles.instagramBtnLabel}>Instagram</Text>
              </LinearGradient>
            </Pressable>
            <Pressable style={{ flex: 1 }} onPress={() => Linking.openURL(FACEBOOK_URL)}>
              <View style={[styles.instagramBtn, { backgroundColor: '#1877F2' }]}>
                <Ionicons name="logo-facebook" size={20} color={colors.white} />
                <Text style={styles.instagramBtnLabel}>Facebook</Text>
              </View>
            </Pressable>
          </View>
        </View>

        <Link href="/(tabs)/adhesion" asChild>
          <Pressable>
            <Card style={styles.joinCard}>
              <Ionicons name="person-add" size={26} color={colors.white} />
              <View style={{ flex: 1, marginLeft: spacing(3) }}>
                <Text style={styles.joinTitle}>Rejoignez l’association</Text>
                <Text style={styles.joinSub}>Militant, membre actif ou bienfaiteur</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.white} />
            </Card>
          </Pressable>
        </Link>
      </View>

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Modifier la mise en avant' : 'Nouvelle mise en avant'}
        onClose={() => setModalVisible(false)}
        onSubmit={submit}
        onDelete={editingId ? confirmDelete : undefined}
        submitting={submitting}
      >
        <View>
          <FieldLabel>Image</FieldLabel>
          {form.imageUrl ? <Image source={{ uri: form.imageUrl }} style={styles.preview} /> : null}
          <Button
            label={picking ? 'Chargement...' : 'Choisir une image'}
            variant="outline"
            icon="image-outline"
            onPress={handlePickImage}
            loading={picking}
          />
        </View>
        <View>
          <FieldLabel>Titre</FieldLabel>
          <Input
            value={form.titre}
            onChangeText={(t) => setForm((f) => ({ ...f, titre: t }))}
            placeholder="Ex : Prochain atelier participatif"
          />
        </View>
        <View>
          <FieldLabel>Description (facultatif)</FieldLabel>
          <Input
            value={form.description}
            onChangeText={(t) => setForm((f) => ({ ...f, description: t }))}
            placeholder="Une phrase courte"
          />
        </View>
        <View>
          <FieldLabel>Au clic, ouvrir...</FieldLabel>
          <View style={styles.destRow}>
            <DestChip
              label="Une rubrique"
              selected={form.destination === 'rubrique'}
              onPress={() => setForm((f) => ({ ...f, destination: 'rubrique' }))}
            />
            <DestChip
              label="Un lien externe"
              selected={form.destination === 'lien'}
              onPress={() => setForm((f) => ({ ...f, destination: 'lien' }))}
            />
            <DestChip
              label="Aucun"
              selected={form.destination === 'aucune'}
              onPress={() => setForm((f) => ({ ...f, destination: 'aucune' }))}
            />
          </View>
        </View>
        {form.destination === 'rubrique' && (
          <View style={styles.destRow}>
            {allDestinations.map((d) => (
              <DestChip
                key={d.href}
                label={d.label}
                selected={form.rubriqueHref === d.href}
                onPress={() => setForm((f) => ({ ...f, rubriqueHref: d.href }))}
              />
            ))}
          </View>
        )}
        {form.destination === 'lien' && (
          <View>
            <FieldLabel>URL</FieldLabel>
            <Input
              value={form.lienExterne ?? ''}
              onChangeText={(t) => setForm((f) => ({ ...f, lienExterne: t }))}
              placeholder="https://..."
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>
        )}
      </FormModal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Supprimer cette mise en avant ?"
        message="Cette action est définitive."
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </ScrollView>
  );
}

function DestChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, selected && styles.chipSelected]}>
      <Text style={[styles.chipLabel, selected && styles.chipLabelSelected]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offWhite },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(7),
  },
  heroTop: {
    marginTop: spacing(3),
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontFamily: typography.heading,
    color: colors.white,
    fontSize: 20,
    marginTop: spacing(4),
  },
  heroText: {
    fontFamily: typography.body,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing(4),
  },
  body: {
    paddingHorizontal: spacing(5),
    marginTop: -spacing(5),
  },
  programmeCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programmeTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  programmeSub: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  gridItem: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing(4),
    ...shadow.card,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(3),
  },
  gridLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  gridDesc: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.grey,
    marginTop: 2,
  },
  joinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coral,
    marginTop: spacing(6),
  },
  joinTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.white,
  },
  joinSub: {
    fontFamily: typography.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing(3),
  },
  instagramBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    paddingVertical: spacing(3.5),
    borderRadius: radii.pill,
  },
  instagramBtnLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.white,
  },
  preview: {
    width: '100%',
    height: 140,
    borderRadius: radii.md,
    marginBottom: spacing(3),
    backgroundColor: colors.greyLight,
  },
  destRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing(2), marginTop: spacing(2) },
  chip: {
    paddingVertical: spacing(2),
    paddingHorizontal: spacing(3.5),
    borderRadius: radii.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  chipSelected: { backgroundColor: colors.navy, borderColor: colors.navy },
  chipLabel: { fontFamily: typography.bodySemiBold, fontSize: 12, color: colors.ink },
  chipLabelSelected: { color: colors.white },
});
