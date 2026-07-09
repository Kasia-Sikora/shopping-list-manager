import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { List } from '../../interfaces';
import { resolveConflict } from '../../utils/resolveConflict';
import { syncEngine } from '../syncEngine';
import * as db from '../indexedDB';
import { apiService } from '../apiService';

vi.unmock('../syncEngine'); // use the REAL syncEngine

beforeEach(() => {
  vi.clearAllMocks(); // reset apiService call counts between tests (DB is reset by global setup)
});

const makeList = (id: string, overrides: Partial<List> = {}): List => ({
  id,
  title: `List ${id}`,
  content: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('syncEngine - Conflict Resolution', () => {
  it('should keep local version when timestamp is newer (12:00 > 11:00)', () => {
    const localList: List = {
      id: 'list-1',
      title: 'Shopping List',
      createdAt: '2026-07-01T11:00:00Z',
      updatedAt: '2026-07-01T12:00:00Z', // Newer
      content: [{ id: '1', value: 'Apple', checked: false, depth: 0, parentId: null }],
    };
    const serverList: List = {
      id: 'list-1',
      title: 'Shopping List',
      createdAt: '2026-07-01T11:00:00Z',
      updatedAt: '2026-07-01T11:00:00Z', // Older
      content: [{ id: '1', value: 'Banana', checked: false, depth: 0, parentId: null }],
    };
    const winner = resolveConflict(localList, serverList);
    expect(winner.content[0].value).toBe('Apple');
  });

  it('should keep server version when timestamp is newer', () => {
    const localList: List = {
      id: 'list-2',
      title: 'Shopping List',
      updatedAt: '2026-07-01T11:00:00Z', // Older
      content: [{ id: '1', value: 'Apple', checked: false, depth: 0, parentId: null }],
    };
    const serverList: List = {
      id: 'list-2',
      title: 'Shopping List',
      updatedAt: '2026-07-01T12:00:00Z', // Newer
      content: [{ id: '1', value: 'Banana', checked: false, depth: 0, parentId: null }],
    };
    const winner = resolveConflict(localList, serverList);
    expect(winner.content[0].value).toBe('Banana');
  });

  it('should fall back to createdAt when updatedAt is missing', () => {
    const localList: List = {
      id: 'list-3',
      title: 'Shopping List',
      createdAt: '2026-07-01T12:00:00Z', // Newer
      content: [{ id: '1', value: 'Apple', checked: false, depth: 0, parentId: null }],
    };
    const serverList: List = {
      id: 'list-3',
      title: 'Shopping List',
      createdAt: '2026-07-01T11:00:00Z', // Older
      content: [{ id: '1', value: 'Banana', checked: false, depth: 0, parentId: null }],
    };
    const winner = resolveConflict(localList, serverList);
    expect(winner.content[0].value).toBe('Apple');
  });
});

describe('syncEngine — syncChanges', () => {
  it('uploads a pending item and clears the queue on success', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    vi.mocked(apiService.createList).mockResolvedValue(makeList('a'));

    await syncEngine.syncChanges();

    expect(apiService.createList).toHaveBeenCalledOnce();
    await expect(db.getSyncQueue()).resolves.toHaveLength(0);
  });

  it('processes every pending item in the queue', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    await db.addToQueue({ action: 'create', data: makeList('b') });
    await db.addToQueue({ action: 'create', data: makeList('c') });

    vi.mocked(apiService.createList).mockResolvedValue(makeList('x'));

    await syncEngine.syncChanges();

    expect(apiService.createList).toHaveBeenCalledTimes(3);
    await expect(db.getSyncQueue()).resolves.toHaveLength(0);
  });

  it('routes create/update/delete to the matching apiService method', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    await db.addToQueue({ action: 'update', data: makeList('a') });
    await db.addToQueue({ action: 'delete', data: makeList('a') });

    vi.mocked(apiService.createList).mockResolvedValue(makeList('a'));
    vi.mocked(apiService.updateList).mockResolvedValue(makeList('a'));
    vi.mocked(apiService.deleteList).mockResolvedValue(makeList('a'));

    await syncEngine.syncChanges();

    expect(apiService.createList).toHaveBeenCalledOnce();
    expect(apiService.updateList).toHaveBeenCalledOnce();
    expect(apiService.deleteList).toHaveBeenCalledOnce();

    await expect(db.getSyncQueue()).resolves.toHaveLength(0);
  });

  it('does NOT clear the queue when an item is still pending/failed', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    vi.mocked(apiService.createList).mockRejectedValue(new Error('network down'));
    const setTimeoutSpy = vi
      .spyOn(globalThis, 'setTimeout')
      .mockReturnValue(0 as unknown as ReturnType<typeof setTimeout>);

    await syncEngine.syncChanges();

    expect(apiService.createList).toHaveBeenCalledTimes(1);
    const queue = await db.getSyncQueue();
    expect(queue).toHaveLength(1);
    expect(queue.map((q) => q.status)).toEqual(['syncing']);
    setTimeoutSpy.mockRestore();
  });

  it('ignores items already marked "synced"', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    await db.addToQueue({ action: 'create', data: makeList('b') });
    await db.updateQueueItemStatus(1, 'synced');
    vi.mocked(apiService.createList).mockResolvedValue(makeList('x'));

    await syncEngine.syncChanges();

    expect(apiService.createList).toHaveBeenCalledTimes(1);
  });
});

describe('syncEngine — _uploadAction', () => {
  it('sets the item status to "synced" on a successful upload', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    const [item] = await db.getSyncQueue();
    vi.mocked(apiService.createList).mockResolvedValue(makeList('a'));

    await syncEngine._uploadAction(item);

    const [updated] = await db.getSyncQueue();
    expect(updated.status).toBe('synced');
  });

  it('writes lastSync metadata on success', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    const [item] = await db.getSyncQueue();
    vi.mocked(apiService.createList).mockResolvedValue(makeList('a'));

    await syncEngine._uploadAction(item);

    const [updated] = await db.getSyncQueue();
    expect(updated.status).toBe('synced');
    await expect(db.getMetadata('lastSync')).resolves.not.toBeFalsy();
  });

  it('calls apiService.createList for a "create" action', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    const [item] = await db.getSyncQueue();
    vi.mocked(apiService.createList).mockResolvedValue(makeList('a'));

    await syncEngine._uploadAction(item);

    expect(apiService.createList).toHaveBeenCalledOnce();
  });

  it('calls apiService.updateList for an "update" action', async () => {
    await db.addToQueue({ action: 'update', data: makeList('a') });
    const [item] = await db.getSyncQueue();
    vi.mocked(apiService.updateList).mockResolvedValue(makeList('a'));

    await syncEngine._uploadAction(item);

    expect(apiService.updateList).toHaveBeenCalledOnce();
  });

  it('calls apiService.deleteList for a "delete" action', async () => {
    await db.addToQueue({ action: 'delete', data: makeList('a') });
    const [item] = await db.getSyncQueue();
    vi.mocked(apiService.deleteList).mockResolvedValue(makeList('a'));

    await syncEngine._uploadAction(item);

    expect(apiService.deleteList).toHaveBeenCalledOnce();
  });

  it('on API failure, schedules a retry and does NOT mark the item synced', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    const [item] = await db.getSyncQueue();
    vi.mocked(apiService.createList).mockRejectedValue(new Error('network down'));
    const setTimeoutSpy = vi
      .spyOn(globalThis, 'setTimeout')
      .mockReturnValue(0 as unknown as ReturnType<typeof setTimeout>);

    await syncEngine._uploadAction(item);
    const queue = await db.getSyncQueue();

    expect(apiService.createList).toHaveBeenCalledOnce();
    expect(queue.map((q) => q.status)).toEqual(['syncing']);
    setTimeoutSpy.mockRestore();
  });
});

describe('syncEngine — _retry (backoff)', () => {
  it('retries a failed item with increasing backoff', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    const [item] = await db.getSyncQueue();
    const setTimeoutSpy = vi
      .spyOn(globalThis, 'setTimeout')
      .mockReturnValue(0 as unknown as ReturnType<typeof setTimeout>);

    await syncEngine._retry({ ...item, retryCount: 3 });

    expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), db.RETRY_BREAK * 3);
    setTimeoutSpy.mockRestore();
  });

  it('marks the item "failed" after exceeding the max retry count (5)', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    const [item] = await db.getSyncQueue();
    const setTimeoutSpy = vi
      .spyOn(globalThis, 'setTimeout')
      .mockReturnValue(0 as unknown as ReturnType<typeof setTimeout>);
    await syncEngine._retry({ ...item, retryCount: 6 });

    const [queueItem] = await db.getSyncQueue();
    expect(queueItem.status).toEqual('failed');
    setTimeoutSpy.mockRestore();
  });

  it('retryCount increments before scheduling a retry', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    const [item] = await db.getSyncQueue(); 
    vi.mocked(apiService.createList).mockRejectedValue(new Error('network down'));
    const retrySpy = vi.spyOn(syncEngine, '_retry').mockResolvedValue(undefined);

    await syncEngine._uploadAction(item);

    expect(retrySpy).toHaveBeenCalledWith(expect.objectContaining({ retryCount: 1 }));

    retrySpy.mockRestore();
  });
});

describe('syncEngine — reconcileLists', () => {
  it('writes a remote-only list into local (pull down)', async () => {
    await syncEngine.reconcileLists([], [makeList('remote-1')]);

    const pulled = await db.getList('remote-1');
    expect(pulled?.id).toBe('remote-1');
  });

  it('leaves a local-only list untouched (no write)', async () => {
    await syncEngine.reconcileLists([makeList('local-1')], []);

    const pulled = await db.getList('local-1');
    expect(pulled?.id).toBeUndefined();
  });

  it('on conflict, writes the winner when remote is newer', async () => {
    const olderList = makeList('1', { updatedAt: '2004-01-01T00:00:00Z', title: 'local' });
    const newerList = makeList('1', {updatedAt: '2005-01-01T00:00:00Z', title: 'remote'});
    await syncEngine.reconcileLists([olderList], [newerList]);

    const pulled = await db.getList('1');
    expect(pulled).toEqual(newerList);
    expect(pulled?.title).toEqual('remote')
  });

  it('on conflict, keeps local (no write) when local is newer', async () => {
    const olderList = makeList('1', { updatedAt: '2004-01-01T00:00:00Z' , title: 'remote'});
    const newerList = makeList('1', {updatedAt: '2005-01-01T00:00:00Z', title: 'local'});
    await syncEngine.reconcileLists([newerList], [olderList]);

    const pulled = await db.getList('1');
    expect(pulled).toBeUndefined();
  });
});