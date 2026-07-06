import type { List } from '../interfaces';
import { updateSyncState } from '../utils/storeUtils';
import {
  clearQueue,
  getAreAllItemsSynced,
  getPendingOrFailedItems,
  RETRY_BREAK,
  setMetadata,
  updateQueueItemStatus,
} from './indexedDB';
import type { SyncQueueWithIdValue } from './interfaces';

type ResponseType = {
  status: 'success' | 'failed';
  id: string;
  data?: List;
  error?: { name: string; message: string };
};

export const syncEngine = {
  async syncChanges() {
    const pendingOrFailedChanges: SyncQueueWithIdValue[] = await getPendingOrFailedItems();
    for (const change of pendingOrFailedChanges) {
      await syncEngine._uploadAction(change);
      await updateSyncState();
    }

    await updateSyncState();
    const isAllSynced = await getAreAllItemsSynced();
    if (isAllSynced) {
      await clearQueue();
    }
  },

  async resolveConflict(local: List, remote: List): Promise<List> {
    if (local.updatedAt && remote.updatedAt) {
      return local.updatedAt > remote.updatedAt ? local : remote;
    }
    if (local.createdAt && remote.createdAt) {
      return local.createdAt > remote.createdAt ? local : remote;
    }

    throw Error("updatedAt or createdAt prop doesn't exist");
  },

  async _uploadAction(action: SyncQueueWithIdValue) {
    if (!action?.id) {
      console.warn('Missing id in action during _uploadAction. ', action);
      return;
    }

    await updateQueueItemStatus(action.id, 'syncing', action.retryCount);
    await updateSyncState();
    let promise = null;
    switch (action.action) {
      case 'create':
        promise = mockApiService.createList(action.data as List);
        break;
      case 'update':
        promise = mockApiService.updateList(action.data.id, action.data as List);
        break;
      case 'delete':
        promise = mockApiService.deleteList(action.data.id);
        break;
    }

    try {
      const res = await promise;
      if (res.status === 'success') {
        await updateQueueItemStatus(action.id, 'synced', action.retryCount);
        await setMetadata('lastSync', new Date().toISOString());
        await updateSyncState();
      } else {
        await syncEngine._retry({ ...action, retryCount: action.retryCount + 1 });
        await updateSyncState();
      }
    } catch (error) {
      console.error('Upload failed:', error);
      await syncEngine._retry({ ...action, retryCount: action.retryCount + 1 });
      await updateSyncState();
    }
  },

  async _retry(action: SyncQueueWithIdValue) {
    if (action.retryCount <= 5) {
      setTimeout(async () => {
        await syncEngine._uploadAction(action);
      }, RETRY_BREAK * action.retryCount);
      return;
    } else {
      await updateQueueItemStatus(action.id, 'failed', action.retryCount);
      await updateSyncState();
    }
  },
};

const mockApiService = {
  async createList(list: List) {
    return new Promise<ResponseType>((resolve) => {
      setTimeout(() => {
        resolve({ status: 'success', id: list.id, data: list });
      }, 300);
    });
  },
  async updateList(id: string, data: List) {
    return new Promise<ResponseType>((resolve) => {
      setTimeout(() => {
        resolve({ status: 'success', id, data });
      }, 300);
    });
  },
  async deleteList(id: string) {
    return new Promise<ResponseType>((resolve) => {
      setTimeout(() => {
        resolve({ status: 'success', id: id });
      }, 300);
    });
  },
};
