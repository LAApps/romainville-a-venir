import { useEffect, useState } from 'react';
import { Link } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card, ScreenHeader } from '../../components/ui';
import { rubriques } from '../../lib/content/navigation';
import { useAdmin } from '../../lib/auth/AdminContext';
import { enablePushNotifications, isPushSupported } from '../../lib/push/webPush';
import { colors, spacing, typography } from '../../lib/theme';

type PushStatus = 'granted' | 'denied' | 'default' | 'unsupported';

export default function MenuScreen() {
  const { isAdmin, adminEmail, isDemo } = useAdmin();
  const [pushStatus, setPushStatus] = useState<PushStatus>('unsupported');
  const [enabling, setEnabling] = useState(false);

  useEffect(() => {
    if (isPushSupported()) setPushStatus(Notification.permission);
  }, []);

  const handleEnablePush = async () => {
    setEnabling(true);
    try {
      const result = await enablePushNotifications();
      if (result === 'granted') {
        setPushStatus('granted');
        Alert.alert('Notifications activées', 'Vous recevrez les annonces importantes de l’association.');
      } else if (result === 'denied') {
        setPushStatus('denied');
        Alert.alert(
          'Notifications refusées',
          'Vous pouvez les réactiver depuis les réglages du navigateur pour ce site.'
        );
      } else {
        Alert.alert('Erreur', 'Impossible d’activer les notifications pour le moment.');
      }
    } finally {
      setEnabling(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Menu" subtitle="Toutes les rubriques" onBack={false} />
      <ScrollView contentContainerStyle={styles.content}>
        {rubriques.map((item) => (
          <Link key={item.href} href={item.href as never} asChild>
            <Pressable>
              <Card style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons name={item.icon} size={22} color={colors.navy} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing(3) }}>
                  <Text style={styles.label}>{item.label}</Text>
                  <Text style={styles.desc}>{item.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.grey} />
              </Card>
            </Pressable>
          </Link>
        ))}

        <Link href="/installer" asChild>
          <Pressable>
            <Card style={[styles.row, { marginTop: spacing(6) }]}>
              <View style={styles.iconWrap}>
                <Ionicons name="phone-portrait-outline" size={22} color={colors.navy} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing(3) }}>
                <Text style={styles.label}>Installer l’application</Text>
                <Text style={styles.desc}>Ajoutez-la sur votre écran d’accueil</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.grey} />
            </Card>
          </Pressable>
        </Link>

        {pushStatus !== 'unsupported' && (
          <Pressable
            disabled={pushStatus !== 'default' || enabling}
            onPress={handleEnablePush}
          >
            <Card style={[styles.row, { marginTop: spacing(6) }]}>
              <View style={styles.iconWrap}>
                <Ionicons name="notifications-outline" size={22} color={colors.navy} />
              </View>
              <View style={{ flex: 1, marginLeft: spacing(3) }}>
                <Text style={styles.label}>Notifications</Text>
                <Text style={styles.desc}>
                  {pushStatus === 'granted'
                    ? 'Activées'
                    : pushStatus === 'denied'
                      ? 'Désactivées dans votre navigateur'
                      : 'Recevez les annonces importantes'}
                </Text>
              </View>
              {pushStatus === 'default' && (
                <Ionicons name="chevron-forward" size={18} color={colors.grey} />
              )}
            </Card>
          </Pressable>
        )}

        {isAdmin && (
          <>
            <Link href="/admin/adhesions" asChild>
              <Pressable>
                <Card style={[styles.row, { marginTop: spacing(6) }]}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="people-outline" size={22} color={colors.navy} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing(3) }}>
                    <Text style={styles.label}>Adhésions reçues</Text>
                    <Text style={styles.desc}>Consulter et filtrer les demandes d’adhésion</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.grey} />
                </Card>
              </Pressable>
            </Link>
            <Link href="/admin/notifications" asChild>
              <Pressable>
                <Card style={styles.row}>
                  <View style={styles.iconWrap}>
                    <Ionicons name="megaphone-outline" size={22} color={colors.navy} />
                  </View>
                  <View style={{ flex: 1, marginLeft: spacing(3) }}>
                    <Text style={styles.label}>Envoyer une notification</Text>
                    <Text style={styles.desc}>Diffuser une annonce à tous les appareils</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.grey} />
                </Card>
              </Pressable>
            </Link>
          </>
        )}

        <Link href="/admin/login" asChild>
          <Pressable>
            <Card style={[styles.row, { marginTop: isAdmin ? 0 : spacing(6) }]}>
              <View style={styles.iconWrap}>
                <Ionicons
                  name={isAdmin ? 'shield-checkmark' : 'lock-closed-outline'}
                  size={22}
                  color={colors.navy}
                />
              </View>
              <View style={{ flex: 1, marginLeft: spacing(3) }}>
                <Text style={styles.label}>{isAdmin ? 'Espace membre — connecté' : 'Espace membre'}</Text>
                <Text style={styles.desc}>
                  {isAdmin
                    ? `${adminEmail}${isDemo ? ' (mode démo)' : ''}`
                    : 'Réservé à l’équipe de l’association'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.grey} />
            </Card>
          </Pressable>
        </Link>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing(5), paddingBottom: spacing(16), gap: spacing(3) },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontFamily: typography.bodySemiBold, fontSize: 14, color: colors.ink },
  desc: { fontFamily: typography.body, fontSize: 11.5, color: colors.grey, marginTop: 2 },
});
