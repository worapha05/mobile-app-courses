import * as SQLite from 'expo-sqlite';

export type CountEntry = {
  id: string;
  sku: string;
  quantity: number;
  updatedAt: string;
  syncedAt: string | null;
};

export type OutboxRow = {
  id: string;
  aggregateId: string;
  type: 'count.upsert';
  payload: string;
  createdAt: string;
  attempts: number;
  lastError: string | null;
};

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

export async function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('offline_counts.db');
      await db.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS counts (
          id TEXT PRIMARY KEY NOT NULL,
          sku TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          updated_at TEXT NOT NULL,
          synced_at TEXT
        );
        CREATE TABLE IF NOT EXISTS outbox (
          id TEXT PRIMARY KEY NOT NULL,
          aggregate_id TEXT NOT NULL,
          type TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at TEXT NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}
