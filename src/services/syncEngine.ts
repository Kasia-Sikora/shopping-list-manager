import type { List } from '../interfaces';
import { getPendingOrFailedItems, RETRY_BREAK, SCHEMA_VERSION, setMetadata, updateQueueItemStatus } from './indexedDB';
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
      await this._uploadAction(change);
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
    await setMetadata('schemaVersion', SCHEMA_VERSION);
    await setMetadata('isOnline', true);
    await updateQueueItemStatus(action.id, 'syncing', action.retryCount);
    let promise = null;
    switch (action.action) {
      case 'create':
        promise = mockApiService.createList(action.data);
        break;
      case 'update':
        promise = mockApiService.updateList(action.data.id, action.data);
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
      }
    } catch (error) {
      console.error('Upload failed:', error);
      await updateQueueItemStatus(action.id, 'failed', action.retryCount);
      await this._retry({ ...action, retryCount: action.retryCount + 1 });
    }
  },

  async _retry(action: SyncQueueWithIdValue) {
    if (action.retryCount <= 5) {
      setTimeout(async () => {
        await this._uploadAction(action);
      }, RETRY_BREAK * action.retryCount);
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
