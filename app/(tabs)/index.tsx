import { Link } from 'expo-router';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import Logo from '../../components/Logo';
import InstagramCarousel from '../../components/InstagramCarousel';
import { Card, SectionLabel } from '../../components/ui';
import { rubriques } from '../../lib/content/navigation';
import { useCollection, type WithId } from '../../lib/data/useCollection';
import type { InstagramPost } from '../../lib/content/types';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../../lib/content/social';
import { colors, radii, shadow, spacing, typography } from '../../lib/theme';

const demoInstagramPosts: WithId<InstagramPost>[] = [
  {
    id: 'demo-1',
    caption: 'Merci à toutes et tous pour cette belle rencontre au marché de l’Horloge ! 🧡',
    imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600',
    permalink: 'https://www.instagram.com/romainville_a_venir/',
    mediaType: 'IMAGE',
    postedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'demo-2',
    caption: 'Retour en images sur notre atelier participatif de la semaine dernière.',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
    permalink: 'https://www.instagram.com/romainville_a_venir/',
    mediaType: 'IMAGE',
    postedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  },
];

export default function HomeScreen() {
  const { items: instagramPosts } = useCollection<InstagramPost>(
    'instagramPosts',
    demoInstagramPosts,
    'postedAt'
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ paddingBottom: spacing(12) }}>
      <View style={styles.hero}>
        <SafeAreaView edges={['top']}>
          <View style={styles.heroTop}>
            <Logo size={64} variant="white" />
          </View>
          <Text style={styles.heroTitle}>L’association citoyenne</Text>
          <Text style={styles.heroText}>
            Informer, rassembler, agir avec vous — suivez l’action de nos 4 élus d’opposition
            et de l’association au quotidien.
          </Text>
        </SafeAreaView>
      </View>

      <View style={styles.body}>
        <Link href="/(tabs)/programme" asChild>
          <Pressable>
            <Card style={styles.programmeCard}>
              <Ionicons name="document-text" size={26} color={colors.navy} />
              <View style={{ flex: 1, marginLeft: spacing(3) }}>
                <Text style={styles.programmeTitle}>Notre programme</Text>
                <Text style={styles.programmeSub}>9 engagements pour Romainville</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.grey} />
            </Card>
          </Pressable>
        </Link>

        <View style={{ marginTop: spacing(6) }}>
          <SectionLabel>Nos rubriques</SectionLabel>
          <View style={styles.grid}>
            {rubriques.map((item) => (
              <Link key={item.href} href={item.href as never} asChild>
                <Pressable style={styles.gridItem}>
                  <View style={styles.gridIcon}>
                    <Ionicons name={item.icon} size={24} color={colors.navy} />
                  </View>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                  <Text style={styles.gridDesc}>{item.description}</Text>
                </Pressable>
              </Link>
            ))}
            <Link href="/(tabs)/elus" asChild>
              <Pressable style={styles.gridItem}>
                <View style={styles.gridIcon}>
                  <Ionicons name="people" size={24} color={colors.navy} />
                </View>
                <Text style={styles.gridLabel}>Le coin des élus</Text>
                <Text style={styles.gridDesc}>Nos 4 élus et leurs actions</Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View style={{ marginTop: spacing(7) }}>
          <SectionLabel>Suivez-nous</SectionLabel>
          <InstagramCarousel posts={instagramPosts} />
          <Pressable onPress={() => Linking.openURL(INSTAGRAM_URL)} style={{ marginTop: spacing(3) }}>
            <LinearGradient
              colors={['#FEDA77', '#DD2A7B', '#8134AF', '#515BD4']}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.instagramBtn}
            >
              <Ionicons name="logo-instagram" size={20} color={colors.white} />
              <Text style={styles.instagramBtnLabel}>Suivre {INSTAGRAM_HANDLE} sur Instagram</Text>
            </LinearGradient>
          </Pressable>
        </View>

        <Link href="/(tabs)/adhesion" asChild>
          <Pressable>
            <Card style={styles.joinCard}>
              <Ionicons name="person-add" size={26} color={colors.white} />
              <View style={{ flex: 1, marginLeft: spacing(3) }}>
                <Text style={styles.joinTitle}>Rejoignez l’association</Text>
                <Text style={styles.joinSub}>Militant, membre actif ou bienfaiteur</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.white} />
            </Card>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.offWhite },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: spacing(5),
    paddingBottom: spacing(7),
  },
  heroTop: {
    marginTop: spacing(3),
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontFamily: typography.heading,
    color: colors.white,
    fontSize: 20,
    marginTop: spacing(4),
  },
  heroText: {
    fontFamily: typography.body,
    color: 'rgba(255,255,255,0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing(4),
  },
  body: {
    paddingHorizontal: spacing(5),
    marginTop: -spacing(5),
  },
  programmeCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programmeTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  programmeSub: {
    fontFamily: typography.body,
    fontSize: 12,
    color: colors.grey,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
  },
  gridItem: {
    width: '47%',
    backgroundColor: colors.white,
    borderRadius: radii.lg,
    padding: spacing(4),
    ...shadow.card,
  },
  gridIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.offWhite,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing(3),
  },
  gridLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.ink,
  },
  gridDesc: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: colors.grey,
    marginTop: 2,
  },
  joinCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.coral,
    marginTop: spacing(6),
  },
  joinTitle: {
    fontFamily: typography.bodySemiBold,
    fontSize: 15,
    color: colors.white,
  },
  joinSub: {
    fontFamily: typography.body,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  instagramBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(2),
    paddingVertical: spacing(3.5),
    borderRadius: radii.pill,
  },
  instagramBtnLabel: {
    fontFamily: typography.bodySemiBold,
    fontSize: 13.5,
    color: colors.white,
  },
});
