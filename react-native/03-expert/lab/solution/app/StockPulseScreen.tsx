import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlashList } from '@shopify/flash-list';

import { JobRow } from '../components/JobRow';
import { incrementCount, listCounts } from '../db/countsRepo';
import { unlockStockPulse } from '../lib/biometrics';
import { buildJobs, type StockJob } from '../lib/jobs';
import { drainOutbox } from '../sync/drainOutbox';

export function StockPulseScreen() {
  const jobs = useMemo(() => buildJobs(1_200), []);
  const [unlocked, setUnlocked] = useState(false);
  const [gateError, setGateError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [syncMsg, setSyncMsg] = useState('ยังไม่ sync');

  const refreshPending = useCallback(async () => {
    const rows = await listCounts();
    setPendingCount(rows.filter((r) => !r.syncedAt).length);
  }, []);

  useEffect(() => {
    if (unlocked) void refreshPending();
  }, [unlocked, refreshPending]);

  const onUnlock = useCallback(async () => {
    const result = await unlockStockPulse();
    if (!result.ok) {
      setGateError(result.reason);
      setUnlocked(false);
      return;
    }
    setGateError(null);
    setUnlocked(true);
  }, []);

  const onSave = useCallback(
    async (job: StockJob) => {
      await incrementCount({ id: job.id, sku: job.sku, by: 1 });
      await refreshPending();
    },
    [refreshPending],
  );

  const onSync = useCallback(async () => {
    const result = await drainOutbox();
    setSyncMsg(`sent=${result.sent} failed=${result.failed}`);
    await refreshPending();
  }, [refreshPending]);

  if (!unlocked) {
    return (
      <View style={styles.gate}>
        <Text style={styles.brand}>StockPulse</Text>
        <Text style={styles.gateBody}>
          ยืนยันตัวตนด้วย FaceID / TouchID / Passcode ก่อนเข้าข้อมูลสต็อก
        </Text>
        {gateError ? <Text style={styles.error}>{gateError}</Text> : null}
        <Pressable style={styles.primary} onPress={() => void onUnlock()}>
          <Text style={styles.primaryText}>ปลดล็อก</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brandLight}>StockPulse</Text>
          <Text style={styles.meta}>
            ค้าง sync {pendingCount} · {syncMsg}
          </Text>
        </View>
        <Pressable style={styles.syncBtn} onPress={() => void onSync()}>
          <Text style={styles.syncText}>Sync</Text>
        </Pressable>
      </View>

      <FlashList
        data={jobs}
        keyExtractor={(item) => item.id}
        estimatedItemSize={72}
        renderItem={({ item }) => <JobRow job={item} onSave={onSave} />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  gate: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
    backgroundColor: '#020617',
  },
  brand: { color: '#f8fafc', fontSize: 32, fontWeight: '900' },
  brandLight: { color: '#0f172a', fontSize: 22, fontWeight: '900' },
  gateBody: { color: '#94a3b8', lineHeight: 22 },
  error: { color: '#f87171' },
  primary: {
    marginTop: 8,
    backgroundColor: '#22c55e',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: { fontWeight: '900', color: '#052e16' },
  screen: { flex: 1, backgroundColor: '#f8fafc' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
  },
  meta: { color: '#475569', marginTop: 2 },
  syncBtn: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  syncText: { color: '#fff', fontWeight: '800' },
});
