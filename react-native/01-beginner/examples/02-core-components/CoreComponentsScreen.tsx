import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

type MenuItem = {
  id: string;
  name: string;
  price: number;
  imageUri: string;
  blurb: string;
};

const MENU: MenuItem[] = [
  {
    id: '1',
    name: 'Latte',
    price: 85,
    imageUri: 'https://images.unsplash.com/photo-1561882468-9110e03e0f78?w=400',
    blurb: 'นมเนียน หอมกาแฟอ่อน',
  },
  {
    id: '2',
    name: 'Espresso',
    price: 60,
    imageUri: 'https://images.unsplash.com/photo-1510591509090-a19eef5348c6?w=400',
    blurb: 'เข้ม ช็อตสั้น',
  },
  {
    id: '3',
    name: 'Matcha',
    price: 95,
    imageUri: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=400',
    blurb: 'ใบชาเขียวบด หวานน้อย',
  },
];

/**
 * ScrollView เหมาะกับเนื้อหาสั้นที่รู้ขอบเขต
 * ถ้ารายการยาว/ไม่จำกัด → ใช้ FlatList แทน
 */
export function CoreComponentsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.brand}>BrewLocal</Text>
        <Text style={styles.subtitle}>เมนูวันนี้</Text>

        {MENU.map((item) => (
          <View key={item.id} style={styles.card}>
            <Image
              source={{ uri: item.imageUri }}
              style={styles.image}
              accessibilityLabel={item.name}
            />
            <View style={styles.meta}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.blurb}>{item.blurb}</Text>
              <Text style={styles.price}>฿{item.price}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff8f1' },
  content: { padding: 20, gap: 16 },
  brand: {
    fontSize: 32,
    fontWeight: '800',
    color: '#3b2f2f',
    letterSpacing: 0.5,
  },
  subtitle: { fontSize: 16, color: '#7c6f64', marginBottom: 4 },
  card: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#e7ddd3',
  },
  image: { width: 112, height: 112 },
  meta: { flex: 1, padding: 14, justifyContent: 'center', gap: 4 },
  name: { fontSize: 18, fontWeight: '700', color: '#2c211d' },
  blurb: { fontSize: 13, color: '#8a7d72' },
  price: { marginTop: 6, fontSize: 16, fontWeight: '700', color: '#b45309' },
});
