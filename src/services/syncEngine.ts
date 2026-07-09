import type { List } from '../interfaces';
import { resolveConflict } from '../utils/resolveConflict';
import { updateSyncState } from '../utils/storeUtils';
import { apiService } from './apiService';
import {
  getPendingOrFailedItems,
  removeFromQueue,
  RETRY_BREAK,
  setMetadata,
  updateList,
  updateQueueItemStatus,
} from './indexedDB';
import type { SyncQueueWithIdValue } from './interfaces';

export const syncEngine = {
  async syncChanges() {
    const pendingOrFailedChanges: SyncQueueWithIdValue[] = await getPendingOrFailedItems();
    for (const change of pendingOrFailedChanges) {
      await syncEngine._uploadAction(change);
      await updateSyncState();
    }

    await updateSyncState();
  },

  async _uploadAction(action: SyncQueueWithIdValue) {
    if (!action?.id) {
      console.warn('Missing id in action during _uploadAction. ', action);
      return;
    }

    await updateQueueItemStatus(action.id, 'syncing', action.retryCount);
    await updateSyncState();
    // eslint-disable-next-line no-useless-assignment
    let promise = null;
    switch (action.action) {
      case 'create':
        promise = apiService.createList(action.data as List);
        break;
      case 'update':
        promise = apiService.updateList(action.data.id, action.data as List);
        break;
      case 'delete':
        promise = apiService.deleteList(action.data.id);
        break;
      default:
        throw Error('Missing action in upload');
    }

    try {
      await promise;
      await setMetadata('lastSync', new Date().toISOString());
      await removeFromQueue(action.id);
      await updateSyncState();
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

  async reconcileLists(local: List[], remote: List[]) {
    const localById = new Map(local.map((l) => [l.id, l]));
    const remoteById = new Map(remote.map((r) => [r.id, r]));
    const allIds = new Set([...localById.keys(), ...remoteById.keys()]);

    for (const id of allIds) {
      const local = localById.get(id);
      const remote = remoteById.get(id);

      if (local && remote) {
        const winner = resolveConflict(local, remote);
        if (winner === remote && winner !== local) await updateList(winner);
      } else if (remote) await updateList(remote);
    }
  },
};
