import type { List } from '../interfaces';

export type SyncAction = 'create' | 'update' | 'delete'
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed'

export type SyncQueueValue = {
  listId: string;
  action: SyncAction;
  data: List;
  timestamp: number;
  status: SyncStatus;
  retryCount: number;
};

export type SyncQueueWithIdValue = SyncQueueValue & {
    id: number;
}

export type MetadataKey = 'lastSync' | 'isOnline' | 'schemaVersion';
export type MetadataValue = string | boolean | number