import { ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../ui';
import { colors, radii, spacing, typography } from '../../lib/theme';

export function FormModal({
  visible,
  title,
  onClose,
  onSubmit,
  onDelete,
  submitLabel = 'Enregistrer',
  children,
  submitting,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  onDelete?: () => void;
  submitLabel?: string;
  children: ReactNode;
  submitting?: boolean;
}) {
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          <View style={styles.headerRow}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.grey} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ gap: spacing(4) }} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
          <View style={styles.actions}>
            {onDelete && (
              <Button label="Supprimer" variant="danger" onPress={onDelete} style={{ flex: 1 }} />
            )}
            <Button
              label={submitLabel}
              onPress={onSubmit}
              loading={submitting}
              style={{ flex: 1 }}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(10,20,30,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing(5),
    maxHeight: '88%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing(4),
  },
  title: {
    fontFamily: typography.heading,
    fontSize: 18,
    color: colors.ink,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing(3),
    marginTop: spacing(4),
  },
  fieldLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 12.5,
    color: colors.ink,
    marginBottom: spacing(1.5),
  },
});
