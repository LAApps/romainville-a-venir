import { useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import {
  AdminFAB,
  Button,
  Card,
  EmptyState,
  IconButton,
  Input,
  ScreenHeader,
  SectionLabel,
} from '../../components/ui';
import { FieldLabel, FormModal } from '../../components/admin/FormModal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { elus } from '../../lib/content/elus';
import { openMailto } from '../../lib/utils/contact';
import { useAdmin } from '../../lib/auth/AdminContext';
import { useCollection, type WithId } from '../../lib/data/useCollection';
import type { Article } from '../../lib/content/types';
import { colors, radii, spacing, typography } from '../../lib/theme';

const demoArticles: WithId<Article>[] = [
  {
    id: 'demo-article-1',
    titre: 'Question écrite sur la sécurisation des abords d’écoles',
    contenu:
      'Nos élus ont interpellé la majorité municipale en conseil sur les délais de mise en place des rues scolaires promises depuis deux ans. Réponse attendue lors de la prochaine séance.',
    media: [],
    date: new Date().toISOString(),
  },
];

function emptyArticle(): Article {
  return { titre: '', contenu: '', media: [], date: new Date().toISOString() };
}

export default function ElusScreen() {
  const { isAdmin } = useAdmin();
  const { items: articles, add, update, remove } = useCollection<Article>(
    'articles',
    demoArticles,
    'date'
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Article>(emptyArticle());
  const [submitting, setSubmitting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyArticle());
    setModalVisible(true);
  };

  const openEdit = (article: WithId<Article>) => {
    setEditingId(article.id);
    setForm(article);
    setModalVisible(true);
  };

  const submit = async () => {
    if (!form.titre.trim() || !form.contenu.trim()) {
      Alert.alert('Champs requis', 'Merci de renseigner au moins un titre et un contenu.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) await update(editingId, form);
      else await add(form);
      setModalVisible(false);
    } catch (e) {
      Alert.alert('Erreur', String(e));
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

  const contactElu = (nom: string, email: string) => {
    const subject = encodeURIComponent(`Message pour ${nom} — via l’application`);
    openMailto(`mailto:${email}?subject=${subject}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader
        title="Le coin des élus"
        subtitle="Nos 4 conseillers municipaux d’opposition"
        onBack={false}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.eluGrid}>
          {elus.map((elu) => (
            <Card key={elu.id} style={styles.eluCard}>
              <Image source={elu.photo} style={styles.eluPhoto} resizeMode="cover" />
              <Text style={styles.eluNom}>{elu.nom}</Text>
              <Text style={styles.eluRole}>{elu.role}</Text>
              <Button
                label="Envoyer un mail"
                variant="outline"
                icon="mail-outline"
                onPress={() => contactElu(elu.nom, elu.email)}
                style={{ marginTop: spacing(3) }}
              />
            </Card>
          ))}
        </View>

        <View style={{ marginTop: spacing(7) }}>
          <SectionLabel>Leurs actions et interpellations</SectionLabel>
          {articles.length === 0 && (
            <EmptyState icon="newspaper-outline" text="Aucun article publié pour le moment." />
          )}
          {articles.map((article) => (
            <Card key={article.id} style={{ marginBottom: spacing(3) }}>
              <View style={styles.articleHeader}>
                <Text style={styles.articleDate}>
                  {new Date(article.date).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
                {isAdmin && (
                  <IconButton name="create-outline" onPress={() => openEdit(article)} />
                )}
              </View>
              <Text style={styles.articleTitre}>{article.titre}</Text>
              <Text style={styles.articleContenu}>{article.contenu}</Text>
              {article.media.map((m, idx) =>
                m.type === 'image' ? (
                  <Image key={idx} source={{ uri: m.url }} style={styles.articleImage} />
                ) : (
                  <Text key={idx} style={styles.articleLink}>
                    {m.type === 'video' ? '🎬 ' : '🔗 '}
                    {m.url}
                  </Text>
                )
              )}
            </Card>
          ))}
        </View>
      </ScrollView>

      {isAdmin && <AdminFAB onPress={openCreate} />}

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Modifier l’article' : 'Nouvel article'}
        onClose={() => setModalVisible(false)}
        onSubmit={submit}
        onDelete={editingId ? confirmDelete : undefined}
        submitting={submitting}
      >
        <View>
          <FieldLabel>Titre</FieldLabel>
          <Input
            value={form.titre}
            onChangeText={(t) => setForm((f) => ({ ...f, titre: t }))}
            placeholder="Ex : Intervention au conseil municipal du..."
          />
        </View>
        <View>
          <FieldLabel>Contenu</FieldLabel>
          <Input
            multiline
            value={form.contenu}
            onChangeText={(t) => setForm((f) => ({ ...f, contenu: t }))}
            placeholder="Détaillez l’action ou l’interpellation..."
          />
        </View>
        <View>
          <FieldLabel>Image, vidéo ou lien (URL — facultatif)</FieldLabel>
          <Input
            value={form.media[0]?.url ?? ''}
            onChangeText={(t) =>
              setForm((f) => ({
                ...f,
                media: t ? [{ type: 'image', url: t }] : [],
              }))
            }
            placeholder="https://..."
            autoCapitalize="none"
          />
        </View>
      </FormModal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Supprimer cet article ?"
        message="Cette action est définitive."
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  eluGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  eluCard: {
    width: '47%',
    alignItems: 'center',
  },
  eluPhoto: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.greyLight,
  },
  eluNom: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.ink,
    marginTop: spacing(3),
    textAlign: 'center',
  },
  eluRole: {
    fontFamily: typography.body,
    fontSize: 10.5,
    color: colors.grey,
    textAlign: 'center',
    marginTop: 2,
  },
  articleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  articleDate: {
    fontFamily: typography.bodyMedium,
    fontSize: 11,
    color: colors.grey,
    textTransform: 'capitalize',
  },
  articleTitre: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
    marginTop: spacing(2),
  },
  articleContenu: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
    marginTop: spacing(2),
  },
  articleImage: {
    width: '100%',
    height: 160,
    borderRadius: radii.md,
    marginTop: spacing(3),
    backgroundColor: colors.greyLight,
  },
  articleLink: {
    fontFamily: typography.bodyMedium,
    fontSize: 12.5,
    color: colors.navy,
    marginTop: spacing(2),
  },
});
