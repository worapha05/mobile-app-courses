import { QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { useCatalog, useLogin, useLogout, useSessionToken } from '../hooks/useCatalogAuth';
import { createQueryClient } from '../lib/queryClient';

/** ห่อ Provider ไว้ที่รากแอปจริง ๆ — ที่นี่รวมเดโมเป็นก้อนเดียว */
export function ReactQueryStorageDemo() {
  const [client] = useState(() => createQueryClient());
  return (
    <QueryClientProvider client={client}>
      <CatalogAuthScreen />
    </QueryClientProvider>
  );
}

function CatalogAuthScreen() {
  const session = useSessionToken();
  const loggedIn = Boolean(session.data);
  const catalog = useCatalog(loggedIn);
  const login = useLogin();
  const logout = useLogout();
  const [email, setEmail] = useState('tech@field.app');
  const [password, setPassword] = useState('demo');

  if (session.isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!loggedIn) {
    return (
      <View style={styles.screen}>
        <Text style={styles.title}>เข้าสู่ระบบ</Text>
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
          onPress={() => login.mutate({ email, password })}
          disabled={login.isPending}
        >
          <Text style={styles.btnText}>{login.isPending ? 'กำลังเข้า…' : 'Login'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.title}>Catalog</Text>
        <Pressable onPress={() => logout.mutate()}>
          <Text style={styles.link}>ออกจากระบบ</Text>
        </Pressable>
      </View>
      {catalog.isLoading ? (
        <ActivityIndicator />
      ) : (
        <FlatList
          data={catalog.data ?? []}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.meta}>
                {item.sku} · สต็อก {item.stock}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  screen: { flex: 1, padding: 20, backgroundColor: '#0b1220', gap: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#f8fafc', fontSize: 24, fontWeight: '800' },
  input: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  btn: {
    backgroundColor: '#38bdf8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  btnText: { fontWeight: '800', color: '#0f172a' },
  error: { color: '#f87171' },
  link: { color: '#7dd3fc', fontWeight: '700' },
  row: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#334155',
  },
  name: { color: '#e2e8f0', fontWeight: '700' },
  meta: { color: '#94a3b8', marginTop: 2 },
});
