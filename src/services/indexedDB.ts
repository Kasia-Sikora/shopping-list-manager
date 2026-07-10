import { openDB, type DBSchema } from 'idb';
import type {
  DbAction,
  MetadataKey,
  MetadataKeyValuePairs,
  MetadataValue,
  SyncQueueValue,
  SyncQueueWithIdValue,
  SyncStatus,
} from './interfaces';
import type { List } from '../interfaces';

export const SCHEMA_VERSION = 1;
export const RETRY_BREAK = 3000;

class QuotaExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'QuotaExceededError';
  }
}

class DatabaseCorruptionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseCorruptionError';
  }
}

interface ShoppingListDB extends DBSchema {
  lists: {
    key: string;
    value: List;
  };
  sync_queue: {
    key: number;
    autoIncrement: true;
    value: SyncQueueValue | SyncQueueWithIdValue;
  };
  metadata: {
    key: string;
    value: MetadataKeyValuePairs;
  };
}

let db: Awaited<ReturnType<typeof openDB<ShoppingListDB>>> | null = null;
export const _resetDbForTests = () => {
  db = null;
};

export const initDB = async () => {
  if (db) return db;
  try {
    db = await openDB<ShoppingListDB>('shopping_list_manager', SCHEMA_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('lists')) {
          db.createObjectStore('lists', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('sync_queue')) {
          db.createObjectStore('sync_queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' });
        }
      },
    });

    return db;
  } catch (error: unknown) {
    console.warn(error);
    throw new DatabaseCorruptionError('Database initialization failed');
  }
};

const getDb = async () => {
  if (!db) await initDB();
  return db as Awaited<ReturnType<typeof openDB<ShoppingListDB>>>;
};

export const getLists = async (): Promise<List[]> => {
  const database = await getDb();
  return database.getAll('lists');
};

export const getList = async (id: string) => {
  const database = await getDb();
  return database.get('lists', id);
};

export const insertList = async (list: List) => {
  try {
    const database = await getDb();
    await database.add('lists', list);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      //TODO prompt message
      console.warn('IndexedDB quota exceeded. Cleanup or prompt user to free space.');
      throw new QuotaExceededError('Storage quota exceeded');
    }
    console.warn('InsertList error :', error, ' list: ', list);
    throw error;
  }
};

export const updateList = async (list: List) => {
  try {
    const database = await getDb();
    await database.put('lists', list);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      //TODO prompt message
      console.warn('IndexedDB quota exceeded. Cleanup or prompt user to free space.');
      throw new QuotaExceededError('Storage quota exceeded');
    }
    console.warn('updateList error :', error, ' list: ', list);
    throw error;
  }
};

export const deleteList = async (id: string) => {
  try {
    const database = await getDb();
    await database.delete('lists', id);
  } catch (error: unknown) {
    console.error(`Failed to delete list ${id}:`, error);
    throw error;
  }
};

export const getSyncQueue = async () => {
  const database = await getDb();
  return database.getAll('sync_queue') as Promise<SyncQueueWithIdValue[]>;
};

export const getPendingOrFailedItems = async () => {
  const database = await getDb();
  const store = (await database.getAll('sync_queue')) as SyncQueueWithIdValue[];
  return store.filter((item) => item.status === 'pending' || item.status === 'failed');
};

export const addToQueue = async (params: DbAction) => {
  try {
    const database = await getDb();
    const syncData: SyncQueueValue = {
      listId: params.data.id,
      action: params.action,
      data: params.data,
      timestamp: Date.now(),
      status: 'pending' as SyncStatus,
      retryCount: 0,
    };
    await database.add('sync_queue', syncData);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      //TODO prompt message
      console.warn('IndexedDB quota exceeded. Cleanup or prompt user to free space.');
      throw new QuotaExceededError('Storage quota exceeded');
    }
    throw error;
  }
};

export const updateQueueItemStatus = async (id: number, status: SyncStatus, retryCount?: number) => {
  const database = await getDb();
  const queue = await database.get('sync_queue', id);

  if (!queue) {
    throw new Error(`Queue item ${id} not found`);
  }

  const updatedQueue = { ...queue, status, retryCount: retryCount ?? queue.retryCount };
  await database.put('sync_queue', updatedQueue);
};

export const removeFromQueue = async (id: number) => {
  const database = await getDb();
  await database.delete('sync_queue', id);
};

export function getMetadata(key: 'listOrder'): Promise<{ key: 'listOrder'; value: string[] } | undefined>;
export function getMetadata(key: 'schemaVersion'): Promise<{ key: 'schemaVersion'; value: number } | undefined>;
export function getMetadata(key: 'lastSync'): Promise<{ key: 'lastSync'; value: string } | undefined>;
export function getMetadata(key: 'isOnline'): Promise<{ key: 'isOnline'; value: boolean } | undefined>;
export async function getMetadata(key: MetadataKey): Promise<MetadataKeyValuePairs | undefined> {
  const database = await getDb();
  return database.get('metadata', key);
}

export function setMetadata(key: 'listOrder', value: string[]): Promise<void>;
export function setMetadata(key: 'schemaVersion', value: number): Promise<void>;
export function setMetadata(key: 'lastSync', value: string): Promise<void>;
export function setMetadata(key: 'isOnline', value: boolean): Promise<void>;
export async function setMetadata(key: MetadataKey, value: MetadataValue): Promise<void> {
  try {
    const database = await getDb();
    await database.put('metadata', { key, value } as MetadataKeyValuePairs);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('IndexedDB quota exceeded. Cleanup or prompt user to free space.');
      throw new QuotaExceededError('Storage quota exceeded');
    }
    throw error;
  }
}
