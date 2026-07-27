import { getStockPulseDb } from '../db/database';

async function mockApiUpsert(payload: unknown) {
  await new Promise((r) => setTimeout(r, 150));
  if (Math.random() < 0.12) throw new Error('SERVER_5XX');
  void payload;
}

export async function drainOutbox(limit = 25) {
  const db = await getStockPulseDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM outbox ORDER BY created_at ASC LIMIT ?',
    [limit],
  );

  let sent = 0;
  let failed = 0;

  for (const row of rows) {
    const id = String(row.id);
    const aggregateId = String(row.aggregate_id);
    try {
      await mockApiUpsert(JSON.parse(String(row.payload)));
      const syncedAt = new Date().toISOString();
      await db.withTransactionAsync(async () => {
        await db.runAsync('UPDATE counts SET synced_at = ? WHERE id = ?', [syncedAt, aggregateId]);
        await db.runAsync('DELETE FROM outbox WHERE id = ?', [id]);
      });
      sent += 1;
    } catch (error) {
      failed += 1;
      await db.runAsync('UPDATE outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?', [
        error instanceof Error ? error.message : 'error',
        id,
      ]);
    }
  }

  return { sent, failed };
}
