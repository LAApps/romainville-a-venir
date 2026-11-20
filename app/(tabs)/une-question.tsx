import { useState } from 'react';
import { Alert, LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
import { useAdmin } from '../../lib/auth/AdminContext';
import { useCollection, type WithId } from '../../lib/data/useCollection';
import { submitCitizenQuestion } from '../../lib/api/submissions';
import type { FaqItem } from '../../lib/content/types';
import { colors, spacing, typography } from '../../lib/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const demoFaq: WithId<FaqItem>[] = [
  {
    id: 'demo-1',
    question: 'Comment adhérer à l’association ?',
    reponse:
      'Rendez-vous dans l’onglet « Adhésion » : le formulaire vous guide selon le statut souhaité (militant, membre actif ou bienfaiteur).',
  },
  {
    id: 'demo-2',
    question: 'Comment contacter nos élus ?',
    reponse:
      'Dans « Le coin des élus », chaque profil dispose d’un bouton pour leur envoyer directement un e-mail.',
  },
];

function emptyFaq(): FaqItem {
  return { question: '', reponse: '' };
}

export default function UneQuestionScreen() {
  const { isAdmin } = useAdmin();
  const faq = useCollection<FaqItem>('faq', demoFaq);
  const [openId, setOpenId] = useState<string | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FaqItem>(emptyFaq());
  const [submitting, setSubmitting] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const [question, setQuestion] = useState({ nom: '', email: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((cur) => (cur === id ? null : id));
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyFaq());
    setModalVisible(true);
  };

  const openEdit = (item: WithId<FaqItem>) => {
    setEditingId(item.id);
    setForm(item);
    setModalVisible(true);
  };

  const submitFaq = async () => {
    if (!form.question.trim() || !form.reponse.trim()) {
      Alert.alert('Champs requis', 'Merci de renseigner une question et une réponse.');
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) await faq.update(editingId, form);
      else await faq.add(form);
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
    await faq.remove(editingId);
    setModalVisible(false);
  };

  const sendQuestion = async () => {
    if (!question.message.trim()) {
      Alert.alert('Message vide', 'Merci de rédiger votre question ou proposition.');
      return;
    }
    setSending(true);
    try {
      await submitCitizenQuestion(question);
      setSent(true);
      setQuestion({ nom: '', email: '', message: '' });
    } catch (e) {
      Alert.alert('Erreur lors de l’envoi', String(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Une question ?" subtitle="FAQ et vos propositions" />
      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel>Questions fréquentes</SectionLabel>
        {faq.items.length === 0 && <EmptyState text="Aucune question publiée pour le moment." />}
        {faq.items.map((item) => {
          const open = openId === item.id;
          return (
            <Pressable key={item.id} onPress={() => toggle(item.id)} style={styles.faqCard}>
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                {isAdmin ? (
                  <IconButton name="create-outline" onPress={() => openEdit(item)} />
                ) : (
                  <Ionicons
                    name={open ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.grey}
                  />
                )}
              </View>
              {open && <Text style={styles.faqReponse}>{item.reponse}</Text>}
            </Pressable>
          );
        })}

        <View style={{ marginTop: spacing(8) }}>
          <SectionLabel>Posez votre question ou proposition</SectionLabel>
          <Card>
            {sent ? (
              <View style={{ alignItems: 'center', paddingVertical: spacing(5) }}>
                <Ionicons name="checkmark-circle" size={40} color={colors.success} />
                <Text style={styles.sentText}>Merci, votre message a bien été transmis à l’association !</Text>
                <Button label="Envoyer un autre message" variant="outline" onPress={() => setSent(false)} style={{ marginTop: spacing(4) }} />
              </View>
            ) : (
              <>
                <FieldLabel>Votre nom (facultatif)</FieldLabel>
                <Input
                  value={question.nom}
                  onChangeText={(t) => setQuestion((q) => ({ ...q, nom: t }))}
                />
                <View style={{ height: spacing(3) }} />
                <FieldLabel>Votre e-mail (facultatif, pour une réponse)</FieldLabel>
                <Input
                  value={question.email}
                  onChangeText={(t) => setQuestion((q) => ({ ...q, email: t }))}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <View style={{ height: spacing(3) }} />
                <FieldLabel>Votre question ou proposition *</FieldLabel>
                <Input
                  multiline
                  value={question.message}
                  onChangeText={(t) => setQuestion((q) => ({ ...q, message: t }))}
                  placeholder="Exprimez-vous librement..."
                />
                <Button
                  label="Envoyer à l’association"
                  icon="send"
                  onPress={sendQuestion}
                  loading={sending}
                  style={{ marginTop: spacing(4) }}
                />
              </>
            )}
          </Card>
        </View>
      </ScrollView>

      {isAdmin && <AdminFAB onPress={openCreate} />}

      <FormModal
        visible={modalVisible}
        title={editingId ? 'Modifier la question' : 'Nouvelle question (FAQ)'}
        onClose={() => setModalVisible(false)}
        onSubmit={submitFaq}
        onDelete={editingId ? confirmDelete : undefined}
        submitting={submitting}
      >
        <View>
          <FieldLabel>Question</FieldLabel>
          <Input value={form.question} onChangeText={(t) => setForm((f) => ({ ...f, question: t }))} />
        </View>
        <View>
          <FieldLabel>Réponse</FieldLabel>
          <Input
            multiline
            value={form.reponse}
            onChangeText={(t) => setForm((f) => ({ ...f, reponse: t }))}
          />
        </View>
      </FormModal>

      <ConfirmDialog
        visible={confirmVisible}
        title="Supprimer cette question ?"
        message="Cette action est définitive."
        onCancel={() => setConfirmVisible(false)}
        onConfirm={handleDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16) },
  faqCard: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing(4),
    marginBottom: spacing(3),
  },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: spacing(2) },
  faqQuestion: { flex: 1, fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.ink },
  faqReponse: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.grey,
    marginTop: spacing(3),
    lineHeight: 19,
  },
  sentText: {
    fontFamily: typography.body,
    fontSize: 13.5,
    color: colors.ink,
    textAlign: 'center',
    marginTop: spacing(3),
  },
});
