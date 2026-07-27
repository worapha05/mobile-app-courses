import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useLogoutMutation, useSession } from '../../hooks/useFieldShelf';

export default function ProfileScreen() {
  const session = useSession();
  const logout = useLogoutMutation();

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>โปรไฟล์พนักงาน</Text>
      <Text style={styles.meta}>session: {session.data ? 'พร้อมใช้งาน' : 'ไม่มี'}</Text>
      <Text style={styles.hint}>
        Token ถูกเก็บใน SecureStore — ไม่แสดงค่าเต็มบนหน้าจอเพื่อความปลอดภัย
      </Text>
      <Pressable
        style={styles.btn}
        onPress={() =>
          logout.mutate(undefined, {
            onSuccess: () => router.replace('/login'),
          })
        }
      >
        <Text style={styles.btnText}>ออกจากระบบ</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 20, gap: 10, backgroundColor: '#f8fafc' },
  title: { fontSize: 22, fontWeight: '800' },
  meta: { color: '#0f172a', fontWeight: '600' },
  hint: { color: '#64748b', lineHeight: 20 },
  btn: {
    marginTop: 12,
    backgroundColor: '#0f172a',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
});
