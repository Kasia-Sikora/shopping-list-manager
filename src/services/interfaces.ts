import type { List } from '../interfaces';

export type SyncAction = 'create' | 'update';
export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export type SyncQueueValue = {
  listId: string;
  action: SyncAction;
  timestamp: number;
  status: SyncStatus;
  retryCount: number;
  listDeleted?: boolean;
};

export type SyncQueueWithIdValue = SyncQueueValue & {
  id: number;
};

export type MetadataKey = 'lastSync' | 'isOnline' | 'schemaVersion' | 'listOrder';
export type MetadataValue = string | boolean | number | string[];
export type MetadataKeyValuePairs =
  | { key: 'isOnline'; value: boolean }
  | { key: 'lastSync'; value: string }
  | { key: 'schemaVersion'; value: number }
  | { key: 'listOrder'; value: string[] };

export type DbAction = { action: 'create' | 'update'; data: List };
