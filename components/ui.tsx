import { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Logo from './Logo';
import { colors, radii, shadow, spacing, typography } from '../lib/theme';

export function ScreenHeader({
  title,
  subtitle,
  onBack = true,
}: {
  title: string;
  subtitle?: string;
  onBack?: boolean;
}) {
  const showBack = onBack && router.canGoBack();
  return (
    <View style={styles.header}>
      <View style={styles.headerTopRow}>
        {showBack ? (
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={22} color={colors.white} />
          </Pressable>
        ) : (
          <View />
        )}
        <Logo size={28} variant="white" kind="mark" />
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      {subtitle ? <Text style={styles.headerSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function Card({
  children,
  style,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  style,
}: {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        isOutline && styles.btnOutline,
        isGhost && styles.btnGhost,
        isDanger && styles.btnDanger,
        (disabled || loading) && { opacity: 0.6 },
        pressed && { transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline || isGhost ? colors.navy : colors.white} />
      ) : (
        <>
          {icon && (
            <Ionicons
              name={icon}
              size={18}
              color={isOutline || isGhost ? colors.navy : colors.white}
              style={{ marginRight: 8 }}
            />
          )}
          <Text
            style={[
              styles.btnLabel,
              (isOutline || isGhost) && { color: colors.navy },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

export function Badge({ label, tone = 'navy' }: { label: string; tone?: 'navy' | 'coral' | 'grey' }) {
  const bg = tone === 'coral' ? colors.coral : tone === 'grey' ? colors.greyLight : colors.navy;
  const fg = tone === 'grey' ? colors.ink : colors.white;
  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.badgeLabel, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function EmptyState({ icon = 'information-circle-outline', text }: { icon?: keyof typeof Ionicons.glyphMap; text: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name={icon} size={32} color={colors.grey} />
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

export function AdminFAB({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.fab} onPress={onPress}>
      <Ionicons name="add" size={28} color={colors.white} />
    </Pressable>
  );
}

export function Input(props: TextInputProps & { multiline?: boolean }) {
  return (
    <TextInput
      placeholderTextColor={colors.grey}
      style={[styles.input, props.multiline && styles.inputMultiline, props.style]}
      {...props}
    />
  );
}

export function IconButton({
  name,
  onPress,
  color = colors.navy,
  size = 20,
}: {
  name: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
  size?: number;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={10} style={styles.iconBtn}>
      <Ionicons name={name} size={size} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.navy,
    paddingTop: spacing(16),
    paddingBottom: spacing(6),
    paddingHorizontal: spacing(5),
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontFamily: typography.heading,
    fontSize: 24,
    color: colors.white,
  },
  headerSubtitle: {
    fontFamily: typography.body,
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: spacing(1),
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing(4),
    ...shadow.card,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.coral,
    paddingVertical: spacing(3.5),
    paddingHorizontal: spacing(5),
    borderRadius: radii.pill,
  },
  btnOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.navy,
  },
  btnGhost: {
    backgroundColor: 'transparent',
  },
  btnDanger: {
    backgroundColor: '#C94A3D',
  },
  btnLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.white,
  },
  badge: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1),
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  badgeLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 11,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(10),
    gap: spacing(2),
  },
  emptyText: {
    fontFamily: typography.body,
    color: colors.grey,
    textAlign: 'center',
    paddingHorizontal: spacing(8),
  },
  sectionLabel: {
    fontFamily: typography.subheading,
    fontSize: 13,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: colors.navy,
    marginBottom: spacing(2),
  },
  fab: {
    position: 'absolute',
    right: spacing(5),
    bottom: spacing(8),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.greyLight,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(3),
    fontFamily: typography.body,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  inputMultiline: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
});
