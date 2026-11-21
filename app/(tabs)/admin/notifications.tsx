import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { Button, Card, Input, ScreenHeader } from '../../../components/ui';
import { FieldLabel } from '../../../components/admin/FormModal';
import { useAdmin } from '../../../lib/auth/AdminContext';
import { sendPushNotification } from '../../../lib/api/push';
import { colors, spacing, typography } from '../../../lib/theme';

export default function AdminNotificationsScreen() {
  const { isAdmin } = useAdmin();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    if (!title.trim() || !body.trim()) {
      Alert.alert('Champs requis', 'Merci de renseigner un titre et un message.');
      return;
    }
    setSending(true);
    try {
      const { sent } = await sendPushNotification(title.trim(), body.trim());
      Alert.alert(
        'Notification envoyée',
        sent > 0
          ? `Envoyée à ${sent} appareil${sent > 1 ? 's' : ''}.`
          : 'Aucun appareil n’a encore activé les notifications.'
      );
      setTitle('');
      setBody('');
    } catch (e) {
      Alert.alert('Erreur lors de l’envoi', String(e));
    } finally {
      setSending(false);
    }
  };

  if (!isAdmin) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
        <ScreenHeader title="Notifications" subtitle="Réservé à l’équipe de l’association" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Envoyer une notification" subtitle="Diffusée à tous les appareils inscrits" />
      <View style={styles.content}>
        <Card>
          <FieldLabel>Titre</FieldLabel>
          <Input value={title} onChangeText={setTitle} placeholder="Ex : Conseil municipal ce soir" />
          <View style={{ height: spacing(3) }} />
          <FieldLabel>Message</FieldLabel>
          <Input
            multiline
            value={body}
            onChangeText={setBody}
            placeholder="Le conseil municipal est en direct dès 19h..."
          />
          <Button
            label="Envoyer"
            icon="send"
            onPress={submit}
            loading={sending}
            style={{ marginTop: spacing(5) }}
          />
        </Card>
        <Text style={styles.hint}>
          Seules les personnes ayant activé les notifications (Menu → Notifications) la
          recevront.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5) },
  hint: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.grey,
    marginTop: spacing(4),
    lineHeight: 17,
  },
});
