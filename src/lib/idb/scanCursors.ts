/**
 * IndexedDB cursor persistence for Umbra UTXO scanner.
 *
 * The Umbra scanner is stateful — it needs to resume from the last scanned
 * insertion index to avoid rescanning from genesis on every page load.
 *
 * Key format: `{walletAddress}:{cluster}:{treeIndex}`
 * Value: last successfully processed insertionIndex
 *
 * Source: https://sdk.umbraprivacy.com/sdk/mixer/fetching-utxos
 */

import { openDB, type IDBPDatabase } from "idb";

const DB_NAME = "stealthbooks-scanner";
const STORE_NAME = "cursors";
const DB_VERSION = 1;

let _db: IDBPDatabase | null = null;

async function getDb(): Promise<IDBPDatabase> {
  if (_db) return _db;
  _db = await openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    },
  });
  return _db;
}

function cursorKey(walletAddress: string, cluster: string, treeIndex: number): string {
  return `${walletAddress}:${cluster}:${treeIndex}`;
}

/** Get the last known insertion index for a given tree */
export async function getCursor(
  walletAddress: string,
  cluster: string,
  treeIndex: number
): Promise<number> {
  const db = await getDb();
  const val = await db.get(STORE_NAME, cursorKey(walletAddress, cluster, treeIndex));
  return typeof val === "number" ? val : 0;
}

/** Persist a new cursor after scanning */
export async function setCursor(
  walletAddress: string,
  cluster: string,
  treeIndex: number,
  insertionIndex: number
): Promise<void> {
  const db = await getDb();
  await db.put(STORE_NAME, insertionIndex, cursorKey(walletAddress, cluster, treeIndex));
}

/** Reset cursors for a wallet (e.g. full rescan) */
export async function resetCursors(walletAddress: string, cluster: string): Promise<void> {
  const db = await getDb();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const keys = await store.getAllKeys();
  const prefix = `${walletAddress}:${cluster}:`;
  await Promise.all(
    keys
      .filter((k) => String(k).startsWith(prefix))
      .map((k) => store.delete(k))
  );
  await tx.done;
}
