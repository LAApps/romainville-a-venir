import { useState } from 'react';
import { LayoutAnimation, Platform, Pressable, ScrollView, StyleSheet, Text, UIManager, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ScreenHeader, Badge } from '../../components/ui';
import { programmePiliers } from '../../lib/content/programme';
import { colors, radii, shadow, spacing, typography } from '../../lib/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function ProgrammeScreen() {
  const [openId, setOpenId] = useState<string | null>(programmePiliers[0]?.id ?? null);

  const toggle = (id: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenId((current) => (current === id ? null : id));
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader
        title="Notre programme"
        subtitle="Les engagements de Romainville à Venir"
        onBack={false}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {programmePiliers.map((pilier) => {
          const open = openId === pilier.id;
          return (
            <Pressable key={pilier.id} onPress={() => toggle(pilier.id)} style={styles.card}>
              <View style={styles.cardHeader}>
                <Badge label={pilier.numero} />
                <Text style={styles.cardTitle}>{pilier.titre}</Text>
                <Ionicons
                  name={open ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.grey}
                />
              </View>
              <Text style={styles.accroche}>{pilier.accroche}</Text>
              {open && (
                <View style={styles.points}>
                  {pilier.points.map((point, idx) => (
                    <View key={idx} style={styles.pointRow}>
                      <View style={styles.bullet} />
                      <Text style={styles.pointText}>{point}</Text>
                    </View>
                  ))}
                </View>
              )}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(14), gap: spacing(3) },
  card: {
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing(4),
    ...shadow.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  cardTitle: {
    flex: 1,
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  accroche: {
    fontFamily: typography.body,
    fontSize: 12.5,
    color: colors.grey,
    marginTop: spacing(2),
    marginLeft: spacing(0),
  },
  points: {
    marginTop: spacing(4),
    gap: spacing(2.5),
  },
  pointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing(2),
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.coral,
    marginTop: 7,
  },
  pointText: {
    flex: 1,
    fontFamily: typography.body,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 19,
  },
});
