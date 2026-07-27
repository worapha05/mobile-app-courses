import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Product } from '../lib/api';

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{product.name}</Text>
          <Text style={styles.sku}>{product.sku}</Text>
        </View>
        <View style={styles.right}>
          <Text style={styles.price}>฿{product.price}</Text>
          <Text style={styles.stock}>สต็อก {product.stock}</Text>
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },
  name: { fontWeight: '800', fontSize: 16, color: '#0f172a' },
  sku: { color: '#94a3b8', marginTop: 2 },
  right: { alignItems: 'flex-end' },
  price: { fontWeight: '800', color: '#0369a1' },
  stock: { color: '#64748b', marginTop: 2 },
});
