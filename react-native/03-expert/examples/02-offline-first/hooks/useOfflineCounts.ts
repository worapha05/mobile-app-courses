import { useCallback, useEffect, useState } from 'react';

import { listCounts, upsertCountLocal } from '../db/countsRepo';
import type { CountEntry } from '../db/schema';
import { drainOutbox } from '../sync/outboxEngine';

export function useOfflineCounts() {
  const [items, setItems] = useState<CountEntry[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setItems(await listCounts());
  }, []);

  const save = useCallback(
    async (input: { id: string; sku: string; quantity: number }) => {
      await upsertCountLocal(input);
      await refresh();
    },
    [refresh],
  );

  const syncNow = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await drainOutbox();
      setLastSync(`sent=${result.sent} failed=${result.failed}`);
      await refresh();
    } finally {
      setSyncing(false);
    }
  }, [refresh]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { items, save, syncNow, syncing, lastSync, refresh };
}
