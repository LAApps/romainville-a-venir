import { useState } from 'react';
import { FlatList, Image, Linking, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, typography } from '../lib/theme';
import type { WithId } from '../lib/data/useCollection';
import type { InstagramPost } from '../lib/content/types';

export default function InstagramCarousel({ posts }: { posts: WithId<InstagramPost>[] }) {
  const [index, setIndex] = useState(0);
  const { width } = useWindowDimensions();
  const ITEM_WIDTH = Math.min(width - spacing(10), 280);

  if (posts.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="logo-instagram" size={28} color={colors.grey} />
        <Text style={styles.emptyText}>Publications à venir.</Text>
      </View>
    );
  }

  return (
    <View>
      <FlatList
        data={posts}
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
          <Pressable
            style={[styles.slide, { width: ITEM_WIDTH }]}
            onPress={() => Linking.openURL(item.permalink)}
          >
            <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="cover" />
            {item.mediaType === 'VIDEO' && (
              <View style={styles.playBadge}>
                <Ionicons name="play" size={16} color={colors.white} />
              </View>
            )}
            {item.caption ? (
              <View style={styles.captionWrap}>
                <Text style={styles.caption} numberOfLines={2}>
                  {item.caption}
                </Text>
              </View>
            ) : null}
          </Pressable>
        )}
      />
      <View style={styles.dots}>
        {posts.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  slide: {
    height: 280,
    borderRadius: radii.lg,
    overflow: 'hidden',
    backgroundColor: colors.greyLight,
  },
  image: { width: '100%', height: '100%' },
  playBadge: {
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
  captionWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(10,20,30,0.6)',
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(2),
  },
  caption: { fontFamily: typography.body, fontSize: 11.5, color: colors.white },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: spacing(3) },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.border },
  dotActive: { backgroundColor: colors.coral, width: 16 },
  empty: { alignItems: 'center', paddingVertical: spacing(6), gap: spacing(2) },
  emptyText: { fontFamily: typography.body, color: colors.grey, fontSize: 13 },
});
