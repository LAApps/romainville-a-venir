import { useState } from 'react';
import { FlatList, Image, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../lib/theme';
import type { WithId } from '../lib/data/useCollection';
import type { GalleryPhoto } from '../lib/content/types';

export default function Carousel({
  photos,
  isAdmin,
  onDelete,
}: {
  photos: WithId<GalleryPhoto>[];
  isAdmin?: boolean;
  onDelete?: (id: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const ITEM_WIDTH = Math.min(width - spacing(10), 420);

  if (photos.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="images-outline" size={28} color={colors.grey} />
        <Text style={styles.emptyText}>Aucune photo pour le moment.</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={ITEM_WIDTH + spacing(3)}
        decelerationRate="fast"
        contentContainerStyle={{ gap: spacing(3) }}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / (ITEM_WIDTH + spacing(3)));
          setIndex(newIndex);
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width: ITEM_WIDTH }]}>
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
            {item.legende ? (
              <View style={styles.captionWrap}>
                <Text style={styles.caption}>{item.legende}</Text>
              </View>
            ) : null}
            {isAdmin && onDelete && (
              <Pressable style={styles.deleteBtn} onPress={() => onDelete(item.id)}>
                <Ionicons name="trash" size={16} color={colors.white} />
              </Pressable>
            )}
          </View>
        )}
      />
      <View style={styles.dots}>
        {photos.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: 220,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.greyLight,
  },
  image: { width: '100%', height: '100%' },
  captionWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,20,30,0.55)',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  caption: { fontFamily: typography.bodyMedium, fontSize: 12, color: colors.white },
  deleteBtn: {
    position: 'absolute',
    top: spacing(2),
    right: spacing(2),
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing(3) },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.coral, width: 16 },
  empty: { alignItems: 'center', paddingVertical: spacing(8), gap: spacing(2) },
  emptyText: { fontFamily: typography.body, color: colors.grey, fontSize: 13 },
});
