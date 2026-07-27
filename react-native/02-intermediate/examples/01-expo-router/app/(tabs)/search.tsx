import { StyleSheet, Text, View } from 'react-native';

export default function SearchScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>ค้นหา</Text>
      <Text style={styles.body}>ต่อยอดด้วย TextInput + debounce ใน Lab</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '800' },
  body: { marginTop: 8, color: '#64748b' },
});
