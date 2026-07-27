import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CategoryChips, type CategoryFilter } from '../components/CategoryChips';
import { MenuRow } from '../components/MenuRow';
import { fetchMenu, type MenuItem } from '../data/menu';
import { getCachedMenu, setCachedMenu } from '../data/menuCache';

type LoadState = 'idle' | 'loading' | 'refreshing' | 'error';

export function BrewBoardScreen() {
  const [items, setItems] = useState<MenuItem[]>(() => getCachedMenu() ?? []);
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [status, setStatus] = useState<LoadState>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const load = useCallback(async (mode: 'loading' | 'refreshing') => {
    setStatus(mode);
    setErrorMessage(null);
    try {
      const next = await fetchMenu();
      setItems(next);
      setCachedMenu(next);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'โหลดเมนูไม่สำเร็จ');
    }
  }, []);

  useEffect(() => {
    void load(getCachedMenu() ? 'refreshing' : 'loading');
  }, [load]);

  const visible = useMemo(() => {
    if (category === 'all') return items;
    return items.filter((item) => item.category === category);
  }, [items, category]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>BrewBoard</Text>
          <Text style={styles.caption}>เมนูหลังบ้าน</Text>
        </View>
        <Text style={styles.count}>{visible.length} รายการ</Text>
      </View>

      <CategoryChips value={category} onChange={setCategory} />

      {status === 'loading' && items.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#9a3412" />
          <Text style={styles.caption}>กำลังโหลดเมนู…</Text>
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MenuRow item={item} />}
          contentContainerStyle={visible.length === 0 ? styles.emptyContainer : styles.listContent}
          ListEmptyComponent={
            <View style={styles.center}>
              <Text style={styles.emptyTitle}>ไม่พบเมนูในหมวดนี้</Text>
            </View>
          }
          ListHeaderComponent={
            errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null
          }
          refreshControl={
            <RefreshControl
              refreshing={status === 'refreshing'}
              onRefresh={() => void load('refreshing')}
              tintColor="#9a3412"
            />
          }
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff7ed' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  brand: { fontSize: 28, fontWeight: '800', color: '#7c2d12' },
  caption: { color: '#a8a29e', marginTop: 2 },
  count: { fontWeight: '700', color: '#9a3412' },
  list: { flex: 1 },
  listContent: { paddingBottom: 24 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  center: { alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#57534e' },
  error: {
    marginHorizontal: 20,
    marginBottom: 8,
    color: '#b91c1c',
    fontWeight: '600',
  },
});
