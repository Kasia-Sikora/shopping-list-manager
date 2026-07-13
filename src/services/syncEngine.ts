import { MAX_RETRIES } from '../consts';
import type { List } from '../interfaces';
import { useSyncStore } from '../stores/store';
import { resolveConflict } from '../utils/resolveConflict';
import { updateSyncState } from '../utils/storeUtils';
import { apiService } from './apiService';
import {
  getPendingItems,
  getPendingOrFailedItems,
  getSyncQueue,
  removeFromQueue,
  RETRY_BREAK,
  setMetadata,
  updateList,
  updateQueueItemStatus,
} from './indexedDB';
import type { SyncQueueWithIdValue } from './interfaces';

// A single in-flight run is shared by every caller (edit, interval, reconnect)
// so overlapping triggers coalesce instead of hitting a dead API with parallel storms.
let syncInFlight: Promise<void> | null = null;

export const syncEngine = {
  async syncChanges() {
    if (syncInFlight) return syncInFlight;

    const run = (async () => {
      try {
        const pendingChanges = await getPendingItems();
        for (const change of pendingChanges) {
          await syncEngine._uploadAction(change);
          await updateSyncState();
        }
        await updateSyncState();
      } finally {
        syncInFlight = null;
      }
    })();

    syncInFlight = run;
    return run;
  },

  async _uploadAction(action: SyncQueueWithIdValue) {
    if (!action?.id) {
      console.warn('Missing id in action during _uploadAction. ', action);
      return;
    }

    if (action.retryCount > MAX_RETRIES) {
      await updateQueueItemStatus(action.id, 'failed', action.retryCount);
      await updateSyncState();
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
        throw new Error('Missing action in upload');
    }

    try {
      await promise;
      await setMetadata('lastSync', new Date().toISOString());
      await removeFromQueue(action.id);
      await updateSyncState();
    } catch (error) {
      if (useSyncStore.getState().isOnline) {
        console.error('Upload failed:', error);
        await syncEngine._retry({ ...action, retryCount: action.retryCount + 1 });
      } else {
        await updateQueueItemStatus(action.id, 'pending', action.retryCount);
      }
      await updateSyncState();
    }
  },

  async _retry(action: SyncQueueWithIdValue) {
    if (action.retryCount <= MAX_RETRIES) {
      setTimeout(async () => {
        await syncEngine._uploadAction(action);
      }, RETRY_BREAK * action.retryCount);
    } else {
      await updateQueueItemStatus(action.id, 'failed', action.retryCount);
      await updateSyncState();
    }
  },

  async retryFailed() {
    // If a run is already in flight, any 'syncing' item is legitimately mid-upload —
    // bail rather than reset it out from under the active run.
    if (syncInFlight) return syncInFlight;

    // Revive both parked failures and stale 'syncing' rows: an interrupted run (reload
    // mid-backoff) or a drop mid-upload leaves items stuck 'syncing' with no path back.
    const queue = await getSyncQueue();
    const stuck = queue.filter((item) => item.status === 'failed' || item.status === 'syncing');
    for (const item of stuck) {
      await updateQueueItemStatus(item.id, 'pending', 0);
    }
    await updateSyncState();

    return syncEngine.syncChanges();
  },

  async reconcileLists(local: List[], remote: List[]) {
    const localById = new Map(local.map((l) => [l.id, l]));
    const remoteById = new Map(remote.map((r) => [r.id, r]));
    const allIds = new Set([...localById.keys(), ...remoteById.keys()]);
    const pendingOrFailedItems = await getPendingOrFailedItems();

    for (const id of allIds) {
      const local = localById.get(id);
      const remote = remoteById.get(id);
      const hasPendingDelete = pendingOrFailedItems.some((item) => item.action === 'delete' && id === item.listId);

      if (!hasPendingDelete) {
        if (local && remote) {
          const winner = resolveConflict(local, remote);
          if (winner === remote && winner !== local) {
            await updateList(winner);
          }
        } else if (remote) await updateList(remote);
      }
    }
  },
};
