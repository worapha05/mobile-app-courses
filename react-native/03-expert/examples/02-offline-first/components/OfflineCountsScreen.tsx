import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useOfflineCounts } from '../hooks/useOfflineCounts';

export function OfflineCountsScreen() {
  const { items, save, syncNow, syncing, lastSync } = useOfflineCounts();
  const [sku, setSku] = useState('SKU-100');
  const [qty, setQty] = useState('1');

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>Offline Counts</Text>
      <Text style={styles.meta}>{lastSync ?? 'ยังไม่ sync'}</Text>

      <View style={styles.form}>
        <TextInput style={styles.input} value={sku} onChangeText={setSku} placeholder="SKU" />
        <TextInput
          style={styles.input}
          value={qty}
          onChangeText={setQty}
          keyboardType="number-pad"
          placeholder="จำนวน"
        />
        <Pressable
          style={styles.btn}
          onPress={() =>
            void save({
              id: sku,
              sku,
              quantity: Number(qty) || 0,
            })
          }
        >
          <Text style={styles.btnText}>บันทึกท้องถิ่น</Text>
        </Pressable>
        <Pressable style={[styles.btn, styles.secondary]} onPress={() => void syncNow()}>
          <Text style={styles.btnText}>{syncing ? 'Syncing…' : 'Drain Outbox'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.sku}>
              {item.sku} · qty {item.quantity}
            </Text>
            <Text style={styles.sync}>{item.syncedAt ? 'synced' : 'pending'}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, padding: 16, backgroundColor: '#0b1020', gap: 10 },
  title: { color: '#f8fafc', fontSize: 22, fontWeight: '900' },
  meta: { color: '#94a3b8' },
  form: { gap: 8 },
  input: {
    backgroundColor: '#1e293b',
    color: '#f8fafc',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  btn: {
    backgroundColor: '#22c55e',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondary: { backgroundColor: '#38bdf8' },
  btnText: { fontWeight: '800', color: '#0f172a' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomColor: '#1e293b',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  sku: { color: '#e2e8f0', fontWeight: '700' },
  sync: { color: '#fbbf24' },
});
