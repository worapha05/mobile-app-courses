import { Stack, useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { getProduct } from '../../lib/products';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const productId = Array.isArray(id) ? id[0] : id;
  const product = getProduct(productId);

  if (!product) {
    return (
      <View style={styles.screen}>
        <Text>ไม่พบสินค้า</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen options={{ title: product.name }} />
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.price}>฿{product.price}</Text>
      <Text style={styles.blurb}>{product.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: '#fff', gap: 8 },
  name: { fontSize: 28, fontWeight: '800' },
  price: { fontSize: 20, fontWeight: '700', color: '#0369a1' },
  blurb: { color: '#475569', lineHeight: 22, marginTop: 8 },
});
