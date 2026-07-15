import { describe, it, expect } from 'vitest';
import * as db from '../indexedDB';
import { makeCreateAction, makeList } from '../../utils/testHelpers';

describe('indexedDB — lists CRUD', () => {
  it('getLists returns all inserted lists', async () => {
    await db.insertList(makeList('a'));
    await db.insertList(makeList('b'));

    const lists = await db.getLists();

    expect(lists).toHaveLength(2);
    expect(lists.map((l) => l.id)).toEqual(['a', 'b']);
  });

  it('getLists returns an empty array when the DB is empty', async () => {
    const lists = await db.getLists();

    expect(lists).toHaveLength(0);
    expect(lists).toEqual([]);
  });

  it('getList returns the list matching the id', async () => {
    await db.insertList(makeList('a'));
    await db.insertList(makeList('b'));
    await db.insertList(makeList('c'));

    const list = await db.getList('b');

    expect(list?.id).toEqual('b');
    expect(list?.title).toEqual('List b');
  });

  it('getList returns undefined when the id is not found', async () => {
    await db.insertList(makeList('a'));
    await db.insertList(makeList('b'));

    await expect(db.getList('d')).resolves.toBeUndefined();
  });

  it('insertList adds a new list', async () => {
    await db.insertList(makeList('a'));
    await db.insertList(makeList('b'));

    await expect(db.getLists()).resolves.toHaveLength(2);

    await db.insertList(makeList('z'));

    const lists = await db.getLists();

    expect(lists).toHaveLength(3);

    const newList = await db.getList('z');
    expect(newList).not.toBeUndefined();
  });

  it('insertList throws ConstraintError when a list with the same id already exists', async () => {
    await db.insertList(makeList('a'));
    await db.insertList(makeList('b'));

    await expect(db.insertList(makeList('b'))).rejects.toThrow();
  });

  it('updateList replaces an existing list', async () => {
    await db.insertList(makeList('a'));
    await db.insertList(makeList('b'));

    const list = await db.getList('b');

    expect(list?.title).toEqual('List b');

    await db.updateList({ ...makeList('b'), title: 'Updated List' });

    const freshList = await db.getList('b');

    expect(freshList?.title).toEqual('Updated List');
  });

  it('updateList inserts the list when the id does not exist yet (put inserts)', async () => {
    await db.insertList(makeList('a'));

    await expect(db.getList('b')).resolves.toBeUndefined();

    await db.updateList(makeList('b'));

    await expect(db.getList('b')).resolves.toBeDefined();
  });

  it('deleteList removes the list with the given id', async () => {
    await db.insertList(makeList('a'));
    await db.insertList(makeList('b'));

    await expect(db.getLists()).resolves.toHaveLength(2);

    await db.deleteList('b');
    const newLists = await db.getLists();
    const deletedList = await db.getList('b');

    expect(newLists).toHaveLength(1);
    expect(deletedList).toBeUndefined();
    expect(newLists.map((l) => l.id)).not.toContain('b');
  });

  it('deleteList leaves other lists untouched', async () => {
    await db.insertList(makeList('a'));
    await db.insertList(makeList('b'));

    const listToStay = await db.getList('a');

    await expect(db.getLists()).resolves.toHaveLength(2);

    const id = await db.deleteList('b');
    const newLists = await db.getLists();
    const deletedList = await db.getList('b');
    const checkListToStay = await db.getList('a');

    expect(newLists).toHaveLength(1);
    expect(deletedList).toBeUndefined();
    expect(newLists.map((l) => l.id)).not.toContain(id);
    expect(listToStay).toEqual(checkListToStay);
  });

  it('should change listItem parentId when parent is nested', async () => {
    await db.insertList(
      makeList('a', {
        content: [
          { id: 'listItem-1', value: 'listItem', checked: false, parentId: null, depth: 0 },
          { id: 'listItem-2', value: 'listItem-2', checked: false, parentId: null, depth: 0 },
          { id: 'listItem-3', value: 'listItem-3', checked: false, parentId: 'listItem-2', depth: 1 },
        ],
      })
    );
    await db.updateList(
      makeList('a', {
        content: [
          { id: 'listItem-1', value: 'listItem', checked: false, parentId: null, depth: 0 },
          { id: 'listItem-2', value: 'listItem-2', checked: false, parentId: 'listItem-1', depth: 1 },
          { id: 'listItem-3', value: 'listItem-3', checked: false, parentId: 'listItem-1', depth: 1 },
        ],
      })
    );

    const list = await db.getList('a');
    expect(list?.content).toEqual([
      { id: 'listItem-1', value: 'listItem', checked: false, parentId: null, depth: 0 },
      { id: 'listItem-2', value: 'listItem-2', checked: false, parentId: 'listItem-1', depth: 1 },
      { id: 'listItem-3', value: 'listItem-3', checked: false, parentId: 'listItem-1', depth: 1 },
    ]);
  });
});

describe('indexedDB — sync queue', () => {
  it('addToQueue adds an action with status "pending" and retryCount 0', async () => {
    await db.addToQueue(makeCreateAction('test-id'));
    const queue = await db.getSyncQueue();

    const queueItem = queue[0];

    expect(queueItem.status).toEqual('pending');
    expect(queueItem.retryCount).toEqual(0);
  });

  it('getSyncQueue returns all queued items', async () => {
    await db.addToQueue(makeCreateAction('test-id'));
    await db.addToQueue(makeCreateAction('test-id-1'));
    await db.addToQueue(makeCreateAction('test-id-2'));
    await db.addToQueue(makeCreateAction('test-id-3'));

    await expect(db.getSyncQueue()).resolves.toHaveLength(4);
  });

  it('getPendingOrFailedItems returns pending and failed items only (not synced/syncing)', async () => {
    await db.addToQueue(makeCreateAction('test-id'));
    await db.addToQueue(makeCreateAction('test-id-1'));
    await db.addToQueue(makeCreateAction('test-id-2'));
    await db.addToQueue(makeCreateAction('test-id-3'));
    await db.updateQueueItemStatus(1, 'syncing');
    await db.updateQueueItemStatus(2, 'failed');
    await db.updateQueueItemStatus(4, 'synced');

    await expect(db.getPendingOrFailedItems()).resolves.toHaveLength(2);
  });

  it('updateQueueItemStatus updates the status of an item', async () => {
    await db.addToQueue(makeCreateAction('test-id'));

    const queue = await db.getSyncQueue();

    expect(queue[0].status).toEqual('pending');

    await db.updateQueueItemStatus(1, 'syncing');

    const newQueue = await db.getSyncQueue();
    expect(newQueue[0].status).toEqual('syncing');
    expect(newQueue[0].retryCount).toEqual(0);
  });

  it('updateQueueItemStatus updates the retryCount when provided', async () => {
    await db.addToQueue(makeCreateAction('test-id'));

    const queue = await db.getSyncQueue();

    expect(queue[0].retryCount).toEqual(0);

    await db.updateQueueItemStatus(1, 'syncing', 5);

    const newQueue = await db.getSyncQueue();
    expect(newQueue[0].retryCount).toEqual(5);
  });

  it('removeFromQueue removes the item with the given id', async () => {
    await db.addToQueue(makeCreateAction('test-id'));
    await db.addToQueue(makeCreateAction('test-id-1'));

    await expect(db.getSyncQueue()).resolves.toHaveLength(2);

    await db.removeFromQueue(1);

    const newQueue = await db.getSyncQueue();
    expect(newQueue).toHaveLength(1);
    expect(newQueue.map((l) => l.id)).toEqual([2]);
  });

  it('addToQueue auto-increments the id', async () => {
    await db.addToQueue(makeCreateAction('test-id'));
    await db.addToQueue(makeCreateAction('test-id-1'));
    const [item1, item2] = await db.getSyncQueue();
    expect(item1.id).toEqual(1);
    expect(item2.id).toEqual(2);
  });

  it('addToQueue delete-coalescing', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    await db.addToQueue({ action: 'update', data: makeList('a') });
    await db.addToQueue({ action: 'delete', data: makeList('a') });
    await db.addToQueue({ action: 'update', data: makeList('a') });

    const queue = await db.getSyncQueue();
    expect(queue).toHaveLength(1);
    expect(queue[0].action).toBe('update');
  });

  it('should enqueue items when update the same list', async () => {
    await db.addToQueue({ action: 'update', data: makeList('a') });
    const [item] = await db.getSyncQueue();

    await db.addToQueue({ action: 'update', data: makeList('a') });
    const [item2] = await db.getSyncQueue();
    const queue = await db.getSyncQueue();

    expect(queue).toHaveLength(1);
    expect(queue[0]).not.toBe(item);
    expect(queue[0]).toStrictEqual(item2);
  });

  it('should enqueue items when update right after create', async () => {
    await db.addToQueue({ action: 'create', data: makeList('a') });
    const [item] = await db.getSyncQueue();

    await db.addToQueue({ action: 'update', data: makeList('a') });
    const [item2] = await db.getSyncQueue();
    const queue = await db.getSyncQueue();

    expect(queue).toHaveLength(1);
    expect(queue[0]).not.toBe(item);
    expect(queue[0]).toStrictEqual({
      ...item,
      data: item2.data,
      timestamp: item2.timestamp,
      retryCount: item2.retryCount,
    });
  });

  it('should not enqueue items when update 2 different lists', async () => {
    await db.addToQueue({ action: 'update', data: makeList('a') });
    await db.addToQueue({ action: 'update', data: makeList('b') });
    const queue = await db.getSyncQueue();

    expect(queue).toHaveLength(2);
  });

  it('should enqueue items with new status and retryCount when first update failed', async () => {
    await db.addToQueue({ action: 'update', data: makeList('a') });

    const [item] = await db.getSyncQueue();
    await db.updateQueueItemStatus(item.id, 'failed');

    await db.addToQueue({ action: 'update', data: makeList('a') });
    const [item2] = await db.getSyncQueue();
    const queue = await db.getSyncQueue();

    expect(queue).toHaveLength(1);
    expect(queue[0]).toStrictEqual({
      ...item,
      data: item2.data,
      timestamp: item2.timestamp,
      retryCount: item2.retryCount,
    });
  });

  it('should not enqueue items when update list and list with the same id is in syncing', async () => {
    await db.addToQueue({ action: 'update', data: makeList('a') });

    const [item] = await db.getSyncQueue();
    await db.updateQueueItemStatus(item.id, 'syncing');

    await db.addToQueue({ action: 'update', data: makeList('a') });
    const queue = await db.getSyncQueue();

    expect(queue).toHaveLength(2);
  });

  it('throws when no item in sync_queue', async () => {
    await expect(db.updateQueueItemStatus(3346346, 'syncing')).rejects.toBeInstanceOf(Error);
  });

  it('getPendingItems should return only pending items', async () => {
    await db.addToQueue({ action: 'update', data: makeList('a') });
    await db.addToQueue({ action: 'update', data: makeList('b') });
    await db.addToQueue({ action: 'update', data: makeList('c') });
    await db.addToQueue({ action: 'update', data: makeList('d') });

    const queue = await db.getSyncQueue();

    expect(queue).toHaveLength(4);

    await db.updateQueueItemStatus(queue[0].id, 'pending');
    await db.updateQueueItemStatus(queue[1].id, 'syncing');
    await db.updateQueueItemStatus(queue[3].id, 'failed');
    await db.updateQueueItemStatus(queue[2].id, 'pending');

    await expect(db.getPendingItems()).resolves.toHaveLength(2);
  });
});

describe('indexedDB — metadata', () => {
  it('setMetadata then getMetadata returns the stored value', async () => {
    await db.setMetadata('isOnline', true);
    await db.setMetadata('schemaVersion', 1);
    await db.setMetadata('listOrder', ['4', '1', '2']);
    await db.setMetadata('lastSync', '24.05.2025');

    await expect(db.getMetadata('isOnline')).resolves.toEqual({
      key: 'isOnline',
      value: true,
    });
    await expect(db.getMetadata('schemaVersion')).resolves.toEqual({
      key: 'schemaVersion',
      value: 1,
    });
    await expect(db.getMetadata('listOrder')).resolves.toEqual({ key: 'listOrder', value: ['4', '1', '2'] });
    await expect(db.getMetadata('lastSync')).resolves.toEqual({ key: 'lastSync', value: '24.05.2025' });
  });

  it('getMetadata returns undefined for a key that was never set', async () => {
    await expect(db.getMetadata('isOnline')).resolves.toBeUndefined();
    await expect(db.getMetadata('schemaVersion')).resolves.toBeUndefined();
    await expect(db.getMetadata('listOrder')).resolves.toBeUndefined();
    await expect(db.getMetadata('lastSync')).resolves.toBeUndefined();
  });

  it('setMetadata overwrites an existing value for the same key', async () => {
    await db.setMetadata('isOnline', true);
    await db.setMetadata('schemaVersion', 1);
    await db.setMetadata('listOrder', ['4', '1', '2']);
    await db.setMetadata('lastSync', '24.05.2025');

    await db.setMetadata('isOnline', false);
    await db.setMetadata('schemaVersion', 34);
    await db.setMetadata('listOrder', ['55', '52', '15']);
    await db.setMetadata('lastSync', '20.05.2003');

    await expect(db.getMetadata('isOnline')).resolves.toEqual({
      key: 'isOnline',
      value: false,
    });
    await expect(db.getMetadata('schemaVersion')).resolves.toEqual({
      key: 'schemaVersion',
      value: 34,
    });
    await expect(db.getMetadata('listOrder')).resolves.toEqual({
      key: 'listOrder',
      value: ['55', '52', '15'],
    });
    await expect(db.getMetadata('lastSync')).resolves.toEqual({
      key: 'lastSync',
      value: '20.05.2003',
    });
  });
});
