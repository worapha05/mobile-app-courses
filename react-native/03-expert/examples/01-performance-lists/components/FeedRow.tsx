import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { FeedItem } from '../lib/feed';

type Props = { item: FeedItem };

/** แยก component + memo ลด re-render ของแถวที่มองไม่เห็นเมื่อ parent อัปเดต */
export const FeedRow = memo(function FeedRow({ item }: Props) {
  return (
    <View style={styles.row}>
      <View style={[styles.dot, item.unread && styles.dotOn]} />
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.sub} numberOfLines={1}>
          {item.subtitle}
        </Text>
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    gap: 12,
    backgroundColor: '#fff',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
  },
  dotOn: { backgroundColor: '#2563eb' },
  title: { fontWeight: '700', color: '#0f172a', fontSize: 16 },
  sub: { color: '#64748b', marginTop: 2 },
});
