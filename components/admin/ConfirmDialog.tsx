import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { Button } from '../ui';
import { colors, radii, spacing, typography } from '../../lib/theme';

// Remplace Alert.alert(...) pour les confirmations destructives : la variante
// multi-boutons de React Native's Alert ne fonctionne pas sur le web
// (react-native-web l'ignore silencieusement), donc on gère nous-mêmes ce
// dialogue, ce qui fonctionne identiquement sur mobile et sur le web.
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Supprimer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.overlay} onPress={onCancel}>
        <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.actions}>
            <Button label={cancelLabel} variant="outline" onPress={onCancel} style={{ flex: 1 }} />
            <Button label={confirmLabel} variant="danger" onPress={onConfirm} style={{ flex: 1 }} />
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
    padding: spacing(5),
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 17,
    color: colors.ink,
  },
  message: {
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.grey,
    marginTop: spacing(2),
    lineHeight: 19,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing(3),
    marginTop: spacing(5),
  },
});
