import { Link } from 'expo-router';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { PRODUCTS } from '../../lib/products';

export default function HomeScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>สินค้าแนะนำ</Text>
      <FlatList
        data={PRODUCTS}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Link href={`/product/${item.id}`} asChild>
            <Pressable style={styles.card}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.price}>฿{item.price}</Text>
            </Pressable>
          </Link>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 12 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  name: { fontWeight: '700', fontSize: 16 },
  price: { fontWeight: '800', color: '#0369a1' },
});
