import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useLoginMutation, useSession } from '../hooks/useFieldShelf';

export default function LoginScreen() {
  const session = useSession();
  const login = useLoginMutation();
  const [email, setEmail] = useState('staff@fieldshelf.app');
  const [password, setPassword] = useState('123');

  if (session.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (session.data) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <View style={styles.screen}>
      <Text style={styles.brand}>FieldShelf</Text>
      <Text style={styles.sub}>ล็อกอินพนักงานคลัง</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        placeholder="อีเมล"
      />
      <TextInput
        style={styles.input}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        placeholder="รหัสผ่าน"
      />
      {login.error ? <Text style={styles.error}>{(login.error as Error).message}</Text> : null}
      <Pressable
        style={styles.btn}
        disabled={login.isPending}
        onPress={() =>
          login.mutate({ email, password }, { onSuccess: () => router.replace('/(tabs)') })
        }
      >
        <Text style={styles.btnText}>{login.isPending ? 'กำลังเข้า…' : 'เข้าสู่ระบบ'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, justifyContent: 'center', padding: 24, gap: 12, backgroundColor: '#eff6ff' },
  brand: { fontSize: 34, fontWeight: '900', color: '#0c4a6e' },
  sub: { color: '#0369a1', marginBottom: 8 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  btn: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { color: '#fff', fontWeight: '800' },
  error: { color: '#b91c1c' },
});
