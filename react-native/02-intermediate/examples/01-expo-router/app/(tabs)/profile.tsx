import { StyleSheet, Text, View } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.screen}>
      <Text style={styles.title}>โปรไฟล์</Text>
      <Text style={styles.body}>เชื่อม SecureStore session ในตัวอย่างถัดไป</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, justifyContent: 'center', backgroundColor: '#f8fafc' },
  title: { fontSize: 24, fontWeight: '800' },
  body: { marginTop: 8, color: '#64748b' },
});
