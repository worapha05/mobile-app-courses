import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { useProduct, useSession } from '../../hooks/useFieldShelf';
import { usePinLocation } from '../../hooks/usePinLocation';

export default function ProductDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const session = useSession();
  const product = useProduct(id ?? '', Boolean(session.data));
  const location = usePinLocation();

  if (product.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!product.data) {
    return (
      <View style={styles.center}>
        <Text>ไม่พบสินค้า</Text>
      </View>
    );
  }

  const item = product.data;

  return (
    <View style={styles.screen}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>{item.sku}</Text>
      <Text style={styles.price}>฿{item.price}</Text>
      <Text style={styles.stock}>คงเหลือ {item.stock}</Text>

      <Pressable style={styles.btn} onPress={() => void location.pin()} disabled={location.loading}>
        <Text style={styles.btnText}>{location.loading ? 'กำลังอ่านพิกัด…' : 'ปักพิกัดโซน'}</Text>
      </Pressable>

      {location.coords ? (
        <Text style={styles.coords}>
          {location.coords.lat.toFixed(5)}, {location.coords.lng.toFixed(5)}
        </Text>
      ) : null}
      {location.error ? <Text style={styles.error}>{location.error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, padding: 20, gap: 8, backgroundColor: '#fff' },
  name: { fontSize: 28, fontWeight: '900', color: '#0f172a' },
  meta: { color: '#94a3b8' },
  price: { fontSize: 22, fontWeight: '800', color: '#0369a1', marginTop: 8 },
  stock: { color: '#475569' },
  btn: {
    marginTop: 16,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
  coords: { fontFamily: 'monospace', marginTop: 8 },
  error: { color: '#b91c1c' },
});
