import { getDb, type OutboxRow } from '../db/schema';
import { markSynced } from '../db/countsRepo';

/** จำลอง server — สุ่มล้มเหลวเพื่อทดสอบ retry */
async function postToServer(payload: unknown): Promise<void> {
  await new Promise((r) => setTimeout(r, 200));
  if (Math.random() < 0.15) {
    throw new Error('SERVER_5XX');
  }
  void payload;
}

export async function listOutbox(limit = 20): Promise<OutboxRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM outbox ORDER BY created_at ASC LIMIT ?',
    [limit],
  );
  return rows.map((row) => ({
    id: String(row.id),
    aggregateId: String(row.aggregate_id),
    type: 'count.upsert' as const,
    payload: String(row.payload),
    createdAt: String(row.created_at),
    attempts: Number(row.attempts),
    lastError: row.last_error == null ? null : String(row.last_error),
  }));
}

export async function drainOutbox(): Promise<{ sent: number; failed: number }> {
  const db = await getDb();
  const batch = await listOutbox(20);
  let sent = 0;
  let failed = 0;

  for (const item of batch) {
    try {
      const body = JSON.parse(item.payload);
      await postToServer(body);
      const syncedAt = new Date().toISOString();
      await db.withTransactionAsync(async () => {
        await markSynced(item.aggregateId, syncedAt);
        await db.runAsync('DELETE FROM outbox WHERE id = ?', [item.id]);
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : 'unknown';
      await db.runAsync('UPDATE outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?', [
        message,
        item.id,
      ]);
    }
  }

  return { sent, failed };
}
