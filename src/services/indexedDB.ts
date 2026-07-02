import { openDB, type DBSchema } from 'idb';
import type { MetadataKey, MetadataValue, SyncAction, SyncQueueValue, SyncQueueWithIdValue, SyncStatus } from './interfaces';
import type { List } from '../interfaces';

export const SCHEMA_VERSION = 1;
export const RETRY_BREAK = 3000

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
    value: {
      key: MetadataKey;
      value: MetadataValue;
    };
  };
}

let db: Awaited<ReturnType<typeof openDB<ShoppingListDB>>> | null = null;

export const initDB = async () => {
  if (db) return db; // Already initialized
  try {
    db = await openDB<ShoppingListDB>('shopping_list_manager', SCHEMA_VERSION, {
      upgrade(db) {
        // Create "lists" object store
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

// Helper to ensure DB is initialized
const getDb = async () => {
  if (!db) await initDB();
  return db as Awaited<ReturnType<typeof openDB<ShoppingListDB>>>;
};

// Lists Operations

export const getLists = async () => {
  const database = await getDb();
  return database.getAll('lists');
};

export const getList = async (id: string) => {
  const database = await getDb();
  return database.get('lists', id);
};

export const upsertList = async (list: List) => {
  try {
    const database = await getDb();
    await database.add('lists', list);
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      //TODO prompt message
      console.warn('IndexedDB quota exceeded. Cleanup or prompt user to free space.');
      throw new QuotaExceededError('Storage quota exceeded');
    }
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

// ============================================
// PHASE 2: Sync Queue & Metadata Operations
// (Will be added when needed in Phase 2)
// ============================================

export const getSyncQueue = async () => {
  const database = await getDb();
  return database.getAll('sync_queue') as Promise<SyncQueueWithIdValue[]>;
};

export const getPendingOrFailedItems = async() => {
   const database = await getDb();
   const store = await database.getAll('sync_queue') as SyncQueueWithIdValue[];
   return store.filter(item => item.status === 'pending' || item.status === 'failed')
}

export const addToQueue = async (action: SyncAction, data: List) => {
  try {
    const database = await getDb();
    const syncData: SyncQueueValue = {
      listId: data.id,
      action: action,
      data: data,
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

export const updateQueueItemStatus = async (id:number, status: SyncStatus, retryCount?: number) => {
  const database = await getDb();
  const queue = await database.get('sync_queue', id);

  if (!queue) {
    throw new Error(`Queue item ${id} not found`);
  }

  const updatedQueue = { ...queue, status, retryCount: retryCount?? queue.retryCount };
  await database.put('sync_queue', updatedQueue);
};

export const removeFromQueue = async (id: number) => {
  const database = await getDb();
  await database.delete('sync_queue', id);
};

export const clearQueue = async () => {
  const database = await getDb();
  await database.clear('sync_queue');
};

export const getMetadata = async (key: MetadataKey) => {
  const database = await getDb();
  return database.get('metadata', key);
};

export const setMetadata = async (key: MetadataKey, value: MetadataValue) => {
  try {
    const database = await getDb();
    await database.put('metadata', {key, value});
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      //TODO prompt message
      console.warn('IndexedDB quota exceeded. Cleanup or prompt user to free space.');
      throw new QuotaExceededError('Storage quota exceeded');
    }
    throw error;
  }
};
