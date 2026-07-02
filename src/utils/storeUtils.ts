import type { ListItem, PersistedShoppingListStore } from '../interfaces';
import { getSyncQueue } from '../services/indexedDB';
import type { DbAction, SyncQueueValue } from '../services/interfaces';
import { useSyncStore } from '../stores/store';
import * as db from '../services/indexedDB';

export const calculateQueueStatus = (queue: SyncQueueValue[]) => {
  if (queue.some((item) => item.status === 'failed')) return 'failed';
  if (queue.some((item) => item.status === 'pending')) return 'pending';
  if (queue.some((item) => item.status === 'syncing')) return 'syncing';
  return 'synced';
};

export const sortList = (list: ListItem[]) => {
  if (!list) return [];
  const uncheckedList = list.filter((item) => !item.checked);
  const checkedItems = list.filter((item) => item.checked);
  return [...uncheckedList, ...checkedItems];
};

export const sortListContent = (storage: PersistedShoppingListStore) => {
  return storage.state?.lists ? storage.state.lists.map((item) => ({ ...item, content: sortList(item.content) })) : [];
};

export const updateSyncState = async () => {
  const store = useSyncStore.getState();
  const fullQueue = await getSyncQueue();
  const overallStatus = calculateQueueStatus(fullQueue);
  const failedCount = fullQueue.filter((q) => q.status === 'failed').length;
  const pendingCount = fullQueue.filter((q) => q.status === 'pending').length;

  store.setSyncStatus(overallStatus);
  store.setPendingChangesCount(pendingCount + failedCount);
};

export const dbActions = async (params: DbAction) => {
  try {
    switch (params.action) {
      case 'create':
        await db.upsertList(params.data);
        break;
      case 'update':
        await db.updateList(params.data);
        break;
      case 'delete':
        await db.deleteList(params.data.id);
        break;
    }

    await db.addToQueue(params);
  } catch (error) {
    console.error(`Failed to ${params.action} list:`, error);
    throw error; 
  }
};
