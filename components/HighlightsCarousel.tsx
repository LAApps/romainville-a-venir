import { useEffect, useRef, useState } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../lib/theme';
import type { WithId } from '../lib/data/useCollection';
import type { Highlight } from '../lib/content/types';

export default function HighlightsCarousel({
  highlights,
  isAdmin,
  onEdit,
}: {
  highlights: WithId<Highlight>[];
  isAdmin?: boolean;
  onEdit?: (highlight: WithId<Highlight>) => void;
}) {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const ITEM_WIDTH = Math.min(width - spacing(10), 420);
  const listRef = useRef<FlatList<WithId<Highlight>>>(null);
  const indexRef = useRef(0);

  const setActiveIndex = (next: number) => {
    indexRef.current = next;
    setIndex(next);
  };

  // Sur le web, le navigateur peut restaurer un défilement horizontal non
  // nul au montage (ancrage de scroll). On repart explicitement de 0 pour
  // que l'index affiché corresponde bien à la première diapositive.
  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
    setActiveIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Défilement automatique toutes les 3 secondes. Un seul minuteur, relancé
  // uniquement si le nombre de diapositives change, pour ne pas dépendre de
  // l'état React (sujet à décalage avec les effets ré-exécutés trop souvent).
  useEffect(() => {
    if (highlights.length <= 1) return;
    const timer = setInterval(() => {
      const nextIndex = (indexRef.current + 1) % highlights.length;
      // animated:false — un scroll animé entre régulièrement en conflit avec
      // le scroll-snap CSS du web (snapToInterval), ce qui désynchronise la
      // position réelle de l'index logique au fil des avances.
      listRef.current?.scrollToOffset({
        offset: nextIndex * (ITEM_WIDTH + spacing(3)),
        animated: false,
      });
      setActiveIndex(nextIndex);
    }, 3000);
    return () => clearInterval(timer);
  }, [highlights.length, ITEM_WIDTH]);

  if (highlights.length === 0) {
    return null;
  }

  const handlePress = (item: WithId<Highlight>) => {
    if (item.destination === 'rubrique' && item.rubriqueHref) {
      router.push(item.rubriqueHref as never);
    } else if (item.destination === 'lien' && item.lienExterne) {
      Linking.openURL(item.lienExterne);
    }
  };

  return (
    <View>
      <FlatList
        ref={listRef}
        data={highlights}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + spacing(3)}
        decelerationRate="fast"
        contentContainerStyle={{ gap: spacing(3) }}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / (ITEM_WIDTH + spacing(3)));
          setActiveIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.slide, { width: ITEM_WIDTH }]}
            onPress={() => handlePress(item)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
            <View style={styles.overlay} />
            <View style={styles.captionWrap}>
              <Text style={styles.titre} numberOfLines={1}>
                {item.titre}
              </Text>
              {item.description ? (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              ) : null}
            </View>
            {item.destination !== 'aucune' && (
              <View style={styles.chevron}>
                <Ionicons name="chevron-forward" size={16} color={colors.white} />
              </View>
            )}
            {isAdmin && onEdit && (
              <Pressable style={styles.editBtn} onPress={() => onEdit(item)}>
                <Ionicons name="create-outline" size={16} color={colors.white} />
              </Pressable>
            )}
          </Pressable>
        )}
      />
      {highlights.length > 1 && (
        <View style={styles.dots}>
          {highlights.map((_, i) => (
            <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: 170,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.greyLight,
  },
  image: { width: '100%', height: '100%' },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(10,20,30,0.25)',
  },
  captionWrap: {
    position: 'absolute',
    left: spacing(4),
    right: spacing(10),
    bottom: spacing(3.5),
  },
  titre: { fontFamily: typography.heading, fontSize: 16, color: colors.white },
  description: {
    fontFamily: typography.body,
    fontSize: 11.5,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  chevron: {
    position: 'absolute',
    right: spacing(3),
    bottom: spacing(4),
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    top: spacing(2),
    right: spacing(2),
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing(3) },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.coral, width: 16 },
});
