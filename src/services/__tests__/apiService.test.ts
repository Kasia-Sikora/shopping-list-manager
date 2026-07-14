import * as db from '../indexedDB';
import { waitFor } from '@testing-library/react';
import { syncEngine } from '../syncEngine';
import { apiService } from '../apiService';
import type { List } from '../../interfaces';
import { fetchApi, HttpError } from '../apiClient';

vi.unmock('../apiService');
vi.mock('../apiClient', async (orig) => ({ ...(await orig()), fetchApi: vi.fn() }));

beforeEach(() => {
  vi.clearAllMocks();
});

const makeList = (id: string, overrides: Partial<List> = {}): List => ({
  id,
  title: `List ${id}`,
  content: [],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides,
});

describe('apiService', () => {
  it('getAllLists requests the lists endpoint and returns the lists', async () => {
    const list = [makeList('a'), makeList('b')];
    vi.mocked(fetchApi).mockResolvedValueOnce(list);

    await expect(apiService.getAllLists()).resolves.toEqual(list);
    expect(fetchApi).toHaveBeenCalledWith(expect.stringContaining('/lists'));
  });

  it('createList requests the lists endpoint and returns the new list', async () => {
    const list = makeList('b');
    vi.mocked(fetchApi).mockResolvedValueOnce(list);

    await expect(apiService.createList(list)).resolves.toEqual(list);
    expect(fetchApi).toHaveBeenCalledWith(
      expect.stringContaining('/lists'),
      expect.objectContaining({ method: 'POST', body: JSON.stringify(list) })
    );
  });

  it('should handle updateList action when list was already deleted (404 status)', async () => {
    const updatedData = makeList('a');
    await db.addToQueue({ action: 'update', data: updatedData });

    vi.mocked(fetchApi).mockRejectedValue(new HttpError(404, 'List already deleted'));

    await waitFor(async () => expect(await db.getSyncQueue()).toHaveLength(1));

    await syncEngine.syncChanges();

    await expect(apiService.updateList('a', updatedData)).resolves.toEqual(updatedData);
  });

  it('should handle updateList action when list was already deleted (410 status)', async () => {
    const updatedData = makeList('a');
    await db.addToQueue({ action: 'update', data: updatedData });
    vi.mocked(fetchApi).mockRejectedValue(new HttpError(410, 'List already deleted'));

    await waitFor(async () => expect(await db.getSyncQueue()).toHaveLength(1));

    await syncEngine.syncChanges();

    await expect(apiService.updateList('a', updatedData)).resolves.toEqual(updatedData);
  });

  it('should throw other errors than 404 while updateList', async () => {
    const updatedData = makeList('a');
    await db.addToQueue({ action: 'update', data: updatedData });
    vi.mocked(fetchApi).mockRejectedValue(new HttpError(500, 'Server is not responding'));

    await waitFor(async () => expect(await db.getSyncQueue()).toHaveLength(1));

    await syncEngine.syncChanges();

    await expect(apiService.updateList('a', updatedData)).rejects.toBeInstanceOf(HttpError);
  });

  it('should handle deleteList action when list was already deleted (404 status)', async () => {
    vi.mocked(fetchApi).mockRejectedValue(new HttpError(404, 'List already deleted'));
    await expect(apiService.deleteList('a')).resolves.toEqual({ id: 'a' });
  });

  it('should handle deleteList action when list was already deleted (410 status)', async () => {
    vi.mocked(fetchApi).mockRejectedValue(new HttpError(410, 'List already deleted'));
    await expect(apiService.deleteList('a')).resolves.toEqual({ id: 'a' });
  });

  it('should throw other errors than 404 while deleteList', async () => {
    vi.mocked(fetchApi).mockRejectedValue(new HttpError(500, 'Server is not responding'));
    await expect(apiService.deleteList('a')).rejects.toBeInstanceOf(HttpError);
  });
});
