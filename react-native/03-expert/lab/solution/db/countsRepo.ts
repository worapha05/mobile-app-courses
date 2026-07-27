import { getStockPulseDb } from './database';

export type CountRecord = {
  id: string;
  sku: string;
  quantity: number;
  updatedAt: string;
  syncedAt: string | null;
};

export async function saveCount(input: {
  id: string;
  sku: string;
  quantity: number;
}): Promise<void> {
  const db = await getStockPulseDb();
  const updatedAt = new Date().toISOString();
  const outboxId = `obx_${input.id}_${Date.now()}`;

  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO counts (id, sku, quantity, updated_at, synced_at)
       VALUES (?, ?, ?, ?, NULL)
       ON CONFLICT(id) DO UPDATE SET
         quantity = excluded.quantity,
         sku = excluded.sku,
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
}

function mapCount(row: Record<string, unknown>): CountRecord {
  return {
    id: String(row.id),
    sku: String(row.sku),
    quantity: Number(row.quantity),
    updatedAt: String(row.updated_at),
    syncedAt: row.synced_at == null ? null : String(row.synced_at),
  };
}

export async function getCount(id: string): Promise<CountRecord | null> {
  const db = await getStockPulseDb();
  const row = await db.getFirstAsync<Record<string, unknown>>('SELECT * FROM counts WHERE id = ?', [
    id,
  ]);
  return row ? mapCount(row) : null;
}

/** ปุ่ม +1 ใน UI — อ่านค่าปัจจุบันแล้วบวก ไม่ทับเป็น 1 ทุกครั้ง */
export async function incrementCount(input: {
  id: string;
  sku: string;
  by?: number;
}): Promise<void> {
  const current = await getCount(input.id);
  const quantity = (current?.quantity ?? 0) + (input.by ?? 1);
  await saveCount({ id: input.id, sku: input.sku, quantity });
}

export async function listCounts(): Promise<CountRecord[]> {
  const db = await getStockPulseDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    'SELECT * FROM counts ORDER BY updated_at DESC LIMIT 100',
  );
  return rows.map(mapCount);
}
