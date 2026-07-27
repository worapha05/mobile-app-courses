import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { FeedRow } from './FeedRow';
import { buildFeed } from '../lib/feed';

type Mode = 'flat' | 'flash';

/**
 * สลับตัวเรนเดอร์เพื่อเทียบความรู้สึก scroll
 * ติดตั้ง: npx expo install @shopify/flash-list
 */
export function PerformanceListsScreen() {
  const data = useMemo(() => buildFeed(5_000), []);
  const [mode, setMode] = useState<Mode>('flash');

  return (
    <View style={styles.screen}>
      <View style={styles.toolbar}>
        <Text style={styles.title}>5,000 rows</Text>
        <View style={styles.row}>
          <Chip label="FlatList" active={mode === 'flat'} onPress={() => setMode('flat')} />
          <Chip label="FlashList" active={mode === 'flash'} onPress={() => setMode('flash')} />
        </View>
      </View>

      {mode === 'flat' ? (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedRow item={item} />}
          getItemLayout={(_, index) => ({ length: 72, offset: 72 * index, index })}
          windowSize={7}
          maxToRenderPerBatch={12}
          removeClippedSubviews
        />
      ) : (
        <FlashList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <FeedRow item={item} />}
          estimatedItemSize={72}
        />
      )}
    </View>
  );
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipOn]}>
      <Text style={[styles.chipText, active && styles.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  toolbar: { padding: 16, gap: 10, backgroundColor: '#0f172a' },
  title: { color: '#f8fafc', fontWeight: '800', fontSize: 18 },
  row: { flexDirection: 'row', gap: 8 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#1e293b',
  },
  chipOn: { backgroundColor: '#38bdf8' },
  chipText: { color: '#cbd5e1', fontWeight: '700' },
  chipTextOn: { color: '#0f172a' },
});
