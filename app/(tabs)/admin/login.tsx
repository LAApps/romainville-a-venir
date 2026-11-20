import { useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Button, Card, Input, ScreenHeader } from '../../../components/ui';
import { FieldLabel } from '../../../components/admin/FormModal';
import { useAdmin } from '../../../lib/auth/AdminContext';
import { colors, spacing, typography } from '../../../lib/theme';

export default function AdminLoginScreen() {
  const { isAdmin, adminEmail, isDemo, signIn, signOut } = useAdmin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e: any) {
      Alert.alert('Connexion impossible', e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.offWhite }}>
      <ScreenHeader title="Espace membre" subtitle="Réservé à l’équipe de l’association" />
      <View style={{ padding: spacing(5) }}>
        {isAdmin ? (
          <Card>
            <Text style={styles.connectedTitle}>Vous êtes connecté(e)</Text>
            <Text style={styles.connectedEmail}>{adminEmail}</Text>
            <Button
              label="Se déconnecter"
              variant="outline"
              onPress={async () => {
                await signOut();
                router.back();
              }}
              style={{ marginTop: spacing(4) }}
            />
          </Card>
        ) : (
          <Card>
            {isDemo && (
              <Text style={styles.demoNotice}>
                Mode démo : Firebase n’est pas encore configuré. Utilisez n’importe quel e-mail et
                le mot de passe « romainville2026 » pour tester le mode admin.
              </Text>
            )}
            <FieldLabel>E-mail</FieldLabel>
            <Input
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="prenom@romainvilleavenir.fr"
            />
            <View style={{ height: spacing(3) }} />
            <FieldLabel>Mot de passe</FieldLabel>
            <Input value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
            <Button
              label="Se connecter"
              onPress={handleSignIn}
              loading={loading}
              style={{ marginTop: spacing(5) }}
            />
          </Card>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  connectedTitle: { fontFamily: typography.bodySemiBold, fontSize: 15, color: colors.ink },
  connectedEmail: { fontFamily: typography.body, fontSize: 13, color: colors.grey, marginTop: 4 },
  demoNotice: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.navy,
    backgroundColor: '#EAF1F5',
    padding: spacing(3),
    borderRadius: 10,
    marginBottom: spacing(4),
    lineHeight: 17,
  },
});
