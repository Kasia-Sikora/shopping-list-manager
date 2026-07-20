import type { List, ListItem } from '../../interfaces';
import * as db from '../../services/indexedDB';
import { syncEngine } from '../../services/syncEngine';
import { getSampleData } from '../../stores/sampleData';
import { useSyncStore } from '../../stores/store';
import { calculateQueueStatus, dbActions, rebuildListOrder, sortByListOrder, sortList } from '../storeUtils';
import { makeCreateAction, makeList } from '../testHelpers';

describe('storeUtils', () => {
  beforeEach(() => {});

  it('calculateQueueStatus returns "synced" for an empty queue', async () => {
    const queue = await db.getSyncQueue();

    expect(calculateQueueStatus(queue)).toEqual('synced');
  });

  it('calculateQueueStatus returns "pending" when any item is pending', async () => {
    await db.addToQueue(makeCreateAction('a'));

    const queue = await db.getSyncQueue();
    await db.updateQueueItemStatus(queue[0].id, 'pending');

    expect(calculateQueueStatus(queue)).toEqual('pending');
  });

  it('calculateQueueStatus returns "syncing" when items are syncing and none are pending', async () => {
    await db.addToQueue(makeCreateAction('a'));
    await db.addToQueue(makeCreateAction('b'));

    const queue = await db.getSyncQueue();
    await db.updateQueueItemStatus(queue[0].id, 'syncing');
    await db.updateQueueItemStatus(queue[1].id, 'syncing');

    expect(calculateQueueStatus(await db.getSyncQueue())).toEqual('syncing');
  });

  it('calculateQueueStatus returns "failed" only when nothing is pending or syncing', async () => {
    await db.addToQueue(makeCreateAction('a'));

    const queue = await db.getSyncQueue();
    await db.updateQueueItemStatus(queue[0].id, 'failed');

    expect(calculateQueueStatus(await db.getSyncQueue())).toEqual('failed');
  });

  it('sortList puts unchecked items before checked ones', () => {
    const data: ListItem[] = getSampleData()[1].content; // ids: 1, 2, 3, 4

    const mappedSortedIds = sortList(data).map((i) => i.id);

    expect(mappedSortedIds).toEqual(['2', '3', '1', '4']);
  });

  it('sortList returns an empty array for a nullish list', () => {
    expect(sortList(null as unknown as ListItem[])).toEqual([]);
  });

  it('sortByListOrder orders lists to match the given id order', () => {
    const orderedLists = ['2', '0'];
    const lists: List[] = getSampleData();

    expect(sortByListOrder(orderedLists, lists)).toStrictEqual([getSampleData()[1], getSampleData()[0]]);
  });

  it('sortByListOrder drops ids that are not present in the provided lists', () => {
    const orderedLists = ['2', '5', '8', '0', '13'];
    const lists: List[] = getSampleData();

    expect(sortByListOrder(orderedLists, lists)).toStrictEqual([getSampleData()[1], getSampleData()[0]]);
  });

  it('rebuildListOrder keeps only ids that still exist in the lists', () => {
    const orderedLists = ['2', '5', '8', '0', '13'];
    const lists: List[] = getSampleData();

    expect(rebuildListOrder(orderedLists, lists)).toStrictEqual(['2', '0']);
  });

  it('dbActions writes the action to indexedDB and enqueues it', async () => {
    await dbActions({ action: 'create', data: makeList('b') });
    await dbActions({ action: 'create', data: makeList('z') });
    await dbActions({ action: 'update', data: makeList('g') });

    const queue = await db.getSyncQueue();
    expect(queue).toHaveLength(3);
  });

  it('dbActions triggers a sync when online', async () => {
    const syncSpy = vi.spyOn(syncEngine, 'syncChanges');
    useSyncStore.setState({ isOnline: true });

    await dbActions({ action: 'create', data: makeList('b') });

    expect(syncSpy).toHaveBeenCalled();
    syncSpy.mockRestore();
  });

  it('dbActions does not trigger a sync when offline', async () => {
    const syncSpy = vi.spyOn(syncEngine, 'syncChanges');
    useSyncStore.setState({ isOnline: false });

    await dbActions({ action: 'create', data: makeList('b') });
    
    expect(syncSpy).not.toHaveBeenCalled();
    syncSpy.mockRestore();
  });
});
