import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export type OrderRow = {
  id: string;
  customer: string;
  total: number;
  status: 'queued' | 'brewing' | 'ready';
};

const SEED: OrderRow[] = [
  { id: 'o-1001', customer: 'Anya', total: 145, status: 'ready' },
  { id: 'o-1002', customer: 'Ben', total: 85, status: 'brewing' },
  { id: 'o-1003', customer: 'Chai', total: 210, status: 'queued' },
  { id: 'o-1004', customer: 'Dao', total: 60, status: 'queued' },
];

/**
 * FlatList = windowing — render เฉพาะแถวใกล้ viewport
 * หลีกเลี่ยงการสร้างฟังก์ชัน/สไตล์ใหม่หนัก ๆ ใน renderItem โดยไม่จำเป็น
 */
export function FlatListPatternsScreen() {
  const [orders, setOrders] = useState<OrderRow[]>(SEED);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await delay(700);
    setOrders((prev) =>
      [...prev]
        .sort(() => Math.random() - 0.5)
        .map((o, i) => ({
          ...o,
          id: `o-${1001 + i}`,
        })),
    );
    setRefreshing(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>คิวออเดอร์</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : styles.list}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={<EmptyState />}
        ListFooterComponent={
          refreshing ? <ActivityIndicator style={{ marginVertical: 16 }} /> : null
        }
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => <OrderItem order={item} />}
      />
    </SafeAreaView>
  );
}

function OrderItem({ order }: { order: OrderRow }) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.customer}>{order.customer}</Text>
        <Text style={styles.meta}>{order.id}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={styles.total}>฿{order.total}</Text>
        <Text style={styles.status}>{order.status}</Text>
      </View>
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

function EmptyState() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>ยังไม่มีออเดอร์</Text>
      <Text style={styles.emptyBody}>ดึงลงเพื่อรีเฟรชเมื่อมีคิวเข้า</Text>
    </View>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  title: {
    fontSize: 24,
    fontWeight: '800',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    color: '#111827',
  },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  emptyContainer: { flexGrow: 1, justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  customer: { fontSize: 16, fontWeight: '700', color: '#111827' },
  meta: { color: '#9ca3af', marginTop: 2 },
  total: { fontWeight: '800', color: '#111827' },
  status: { color: '#059669', marginTop: 2, textTransform: 'capitalize' },
  separator: { height: StyleSheet.hairlineWidth, backgroundColor: '#e5e7eb' },
  empty: { alignItems: 'center', padding: 32, gap: 6 },
  emptyTitle: { fontSize: 18, fontWeight: '700' },
  emptyBody: { color: '#6b7280' },
});
