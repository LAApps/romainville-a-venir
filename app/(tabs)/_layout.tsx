import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography } from '../../lib/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.coral,
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          backgroundColor: colors.navy,
          borderTopWidth: 0,
          height: 86,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontFamily: typography.bodySemiBold,
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          tabBarIcon: ({ color, size }) => <Ionicons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="programme"
        options={{
          title: 'Programme',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="adhesion"
        options={{
          title: 'Adhésion',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-add" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="elus"
        options={{
          title: 'Élus',
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color, size }) => <Ionicons name="grid" size={size} color={color} />,
        }}
      />

      {/* Rubriques secondaires : accessibles depuis l'accueil/le menu, pas via
          un bouton dédié, mais la barre d'onglets doit rester visible dessus. */}
      <Tabs.Screen name="live" options={{ href: null }} />
      <Tabs.Screen name="hors-les-murs" options={{ href: null }} />
      <Tabs.Screen name="ateliers" options={{ href: null }} />
      <Tabs.Screen name="actions-educatives" options={{ href: null }} />
      <Tabs.Screen name="une-question" options={{ href: null }} />
      <Tabs.Screen name="installer" options={{ href: null }} />
      <Tabs.Screen name="mentions-legales" options={{ href: null }} />
      <Tabs.Screen name="confidentialite" options={{ href: null }} />
      <Tabs.Screen name="accessibilite" options={{ href: null }} />
      <Tabs.Screen name="admin/login" options={{ href: null }} />
      <Tabs.Screen name="admin/adhesions" options={{ href: null }} />
      <Tabs.Screen name="admin/notifications" options={{ href: null }} />
    </Tabs>
  );
}
