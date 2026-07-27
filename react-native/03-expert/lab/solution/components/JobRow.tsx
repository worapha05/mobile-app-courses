import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { StockJob } from '../lib/jobs';

type Props = {
  job: StockJob;
  onSave: (job: StockJob) => void;
};

export const JobRow = memo(function JobRow({ job, onSave }: Props) {
  return (
    <View style={styles.row}>
      <View style={{ flex: 1 }}>
        <Text style={styles.title} numberOfLines={1}>
          {job.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {job.sku} · {job.zone}
        </Text>
      </View>
      <Pressable style={styles.btn} onPress={() => onSave(job)}>
        <Text style={styles.btnText}>+1</Text>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    height: 72,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  title: { fontWeight: '800', color: '#0f172a', fontSize: 16 },
  meta: { color: '#64748b', marginTop: 2 },
  btn: {
    backgroundColor: '#0ea5e9',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  btnText: { color: '#fff', fontWeight: '800' },
});
