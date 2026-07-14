import type { List, ListItem, PersistedShoppingListStore } from '../interfaces';
import { getSyncQueue } from '../services/indexedDB';
import type { DbAction, SyncQueueValue } from '../services/interfaces';
import { useSyncStore } from '../stores/store';
import * as db from '../services/indexedDB';
import { syncEngine } from '../services/syncEngine';

export const calculateQueueStatus = (queue: SyncQueueValue[]) => {
  if (queue.some((item) => item.status === 'pending')) return 'pending';
  if (queue.some((item) => item.status === 'syncing')) return 'syncing';
  if (queue.some((item) => item.status === 'failed')) return 'failed';

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
  store.setPendingChangesCount(pendingCount);
  store.setFailedChangesCount(failedCount);
};

export const dbActions = async (params: DbAction) => {
  try {
    switch (params.action) {
      case 'create':
        await db.insertList(params.data);
        break;
      case 'update':
        await db.updateList(params.data);
        break;
      case 'delete':
        await db.deleteList(params.data.id);
        break;
    }

    await db.addToQueue(params);
    if (useSyncStore.getState().isOnline) {
      syncEngine.syncChanges();
    }
  } catch (error) {
    console.error(`Failed to ${params.action} list:`, error);
    throw error;
  }
};

export const sortByListOrder = (list: string[], dbLists: List[]): List[] => {
  if (!list) return [];
  const orderedLists = list.map((id) => dbLists.find((list) => list.id === id)).filter((item) => !!item);
  return orderedLists;
};

export const rebuildListOrder = (listOrder: string[], dbLists: List[]): string[] => {
  if (!listOrder) return [];
  const rebuildListOrder: string[] = [];
  const remoteById = new Map(dbLists.map((r) => [r.id, r]));
  const allIds = new Set([...listOrder, ...remoteById.keys()]);
  for (const id of allIds) {
    const remote = remoteById.get(id);

    if (remote) {
      rebuildListOrder.push(remote.id);
    }
  }
  return rebuildListOrder;
};
