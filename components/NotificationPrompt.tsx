import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui';
import { enablePushNotifications, isPushSupported, isStandalone } from '../lib/push/webPush';
import { colors, radii, spacing, typography } from '../lib/theme';

const SEEN_KEY = 'rav_notification_prompt_seen';

function hasSeenPrompt(): boolean {
  try {
    return localStorage.getItem(SEEN_KEY) === 'true';
  } catch {
    return false;
  }
}

function markPromptSeen() {
  try {
    localStorage.setItem(SEEN_KEY, 'true');
  } catch {
    // Stockage indisponible (navigation privée...) : tant pis, on redemandera.
  }
}

// Invite à activer les notifications la première fois que quelqu'un ouvre
// l'app depuis l'icône ajoutée à l'écran d'accueil (PWA installée) — pas
// dans un onglet de navigateur classique, où l'activation reste accessible
// depuis Menu à tout moment.
export default function NotificationPrompt() {
  const [visible, setVisible] = useState(false);
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (
      isPushSupported() &&
      isStandalone() &&
      Notification.permission === 'default' &&
      !hasSeenPrompt()
    ) {
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    markPromptSeen();
    setVisible(false);
  };

  const handleEnable = async () => {
    setEnabling(true);
    try {
      await enablePushNotifications();
    } finally {
      setEnabling(false);
      close();
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable style={styles.overlay} onPress={close}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <View style={styles.iconWrap}>
            <Ionicons name="notifications" size={28} color={colors.white} />
          </View>
          <Text style={styles.title}>Restez informé</Text>
          <Text style={styles.message}>
            Activez les notifications pour être prévenu des annonces importantes de
            l’association : conseils municipaux en direct, événements à venir...
          </Text>
          <View style={styles.actions}>
            <Button label="Plus tard" variant="outline" onPress={close} style={{ flex: 1 }} />
            <Button
              label="Activer"
              onPress={handleEnable}
              loading={enabling}
              style={{ flex: 1 }}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,20,30,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing(6),
  },
  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing(6),
    alignItems: 'center',
  },
  iconWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.navy,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(4),
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: colors.ink,
  },
  message: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.grey,
    textAlign: 'center',
    marginTop: spacing(2),
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing(3),
    marginTop: spacing(5),
    width: '100%',
  },
});
