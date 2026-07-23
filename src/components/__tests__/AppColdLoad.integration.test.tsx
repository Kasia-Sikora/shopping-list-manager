import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../../App';
import * as db from '../../services/indexedDB';
import { apiService } from '../../services/apiService';
import { syncEngine } from '../../services/syncEngine';
import type { List } from '../../interfaces';

// Regression: on a cold load (empty IndexedDB — incognito / first-time visitor) while online, the
// app must pull lists from the backend. The pull is gated on the sync store's `isOnline`, read
// synchronously at mount; when that flag defaulted to `false`, the fetch was skipped and the user
// saw an empty board even though the backend had data. `isOnline` now seeds from navigator.onLine.
describe('<App /> — cold load pulls from the backend', () => {
  const remoteList: List = {
    id: 'remote-1',
    title: 'From backend',
    content: [{ id: 'a', value: 'Milk', checked: false, depth: 0, parentId: null }],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('fetches and renders backend lists when IndexedDB is empty and the client is online', async () => {
    vi.mocked(apiService.getAllLists).mockResolvedValue([remoteList]);
    vi.mocked(syncEngine.reconcileLists).mockImplementation(async (_local, remote) => {
      for (const list of remote) await db.insertList(list);
    });

    render(<App />);

    await waitFor(() => expect(screen.getByTestId(`card-${remoteList.id}`)).toBeVisible());
    expect(apiService.getAllLists).toHaveBeenCalled();
  });
});
