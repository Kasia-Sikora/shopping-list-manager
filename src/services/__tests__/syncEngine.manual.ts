import { addToQueue, getSyncQueue } from '../indexedDB';
import { syncEngine } from '../syncEngine';
import type { List } from '../../interfaces';

export const testSyncEngine = {
  async testCreateSync() {
    const fakeList: List = {
      id: 'manual-test-' + Date.now(),
      title: 'Manual Test List',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: [
        { id: '1', value: 'Item 1', checked: false, depth: 0, parentId: null },
        { id: '2', value: 'Item 2', checked: false, depth: 0, parentId: null },
      ],
    };

    console.log('📝 [TEST] Adding to queue...');
    await addToQueue('create', fakeList);

    const before = await getSyncQueue();
    console.log('📊 [TEST] Before sync:', before);

    console.log('🚀 [TEST] Running syncEngine.syncChanges()...');
    await syncEngine.syncChanges();

    // Wait for mock API (300ms) + processing
    await new Promise(r => setTimeout(r, 500));

    const after = await getSyncQueue();
    console.log('📊 [TEST] After sync:', after);

    // Verify
    const synced = after.find(item => item.status === 'synced');
    if (synced) {
      console.log('✅ [TEST] SUCCESS: Item synced!', synced);
    } else {
      console.log('❌ [TEST] FAILED: Item not synced', after);
    }
  },

  async testFailThenRetry() {
    const fakeList: List = {
      id: 'manual-test-fail-' + Date.now(),
      title: 'Test Failure Retry',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      content: [],
    };

    console.log('📝 [TEST] Adding to queue...');
    await addToQueue('update', fakeList);

    const before = await getSyncQueue();
    console.log('📊 [TEST] Queue:', before);

    // Note: mockApiService always succeeds, so retry won't trigger
    // But you can test the flow
    console.log('🚀 [TEST] Running sync...');
    await syncEngine.syncChanges();

    await new Promise(r => setTimeout(r, 500));
    const after = await getSyncQueue();
    console.log('📊 [TEST] After sync:', after);
  },
};

// Expose globally for console access
if (typeof window !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (window as any).testSyncEngine = testSyncEngine;
}