import { getDb, type CountEntry } from './schema';

function rowToCount(row: Record<string, unknown>): CountEntry {
  return {
    id: String(row.id),
    sku: String(row.sku),
    quantity: Number(row.quantity),
    updatedAt: String(row.updated_at),
    syncedAt: row.synced_at == null ? null : String(row.synced_at),
  };
}

export async function listCounts(): Promise<CountEntry[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM counts ORDER BY updated_at DESC',
  );
  return rows.map(rowToCount);
}

export async function upsertCountLocal(input: {
  id: string;
  sku: string;
  quantity: number;
}): Promise<CountEntry> {
  const db = await getDb();
  const updatedAt = new Date().toISOString();
  const outboxId = `obx_${input.id}_${Date.now()}`;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO counts (id, sku, quantity, updated_at, synced_at)
       VALUES (?, ?, ?, ?, NULL)
       ON CONFLICT(id) DO UPDATE SET
         sku = excluded.sku,
         quantity = excluded.quantity,
         updated_at = excluded.updated_at,
         synced_at = NULL`,
      [input.id, input.sku, input.quantity, updatedAt],
    );

    await db.runAsync(
      `INSERT INTO outbox (id, aggregate_id, type, payload, created_at, attempts, last_error)
       VALUES (?, ?, 'count.upsert', ?, ?, 0, NULL)`,
      [outboxId, input.id, JSON.stringify({ ...input, updatedAt }), updatedAt],
    );
  });

  return {
    id: input.id,
    sku: input.sku,
    quantity: input.quantity,
    updatedAt,
    syncedAt: null,
  };
}

export async function markSynced(id: string, syncedAt: string) {
  const db = await getDb();
  await db.runAsync('UPDATE counts SET synced_at = ? WHERE id = ?', [syncedAt, id]);
}
