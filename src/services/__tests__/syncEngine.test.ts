import { describe, it, expect } from 'vitest';
import { syncEngine } from '../syncEngine';
import type { List } from '../../interfaces';

describe('syncEngine - Conflict Resolution', () => {
  it('should keep local version when timestamp is newer (12:00 > 11:00)', async () => {
    const localList: List = {
      id: 'list-1',
      title: 'Shopping List',
      createdAt: '2026-07-01T11:00:00Z',
      updatedAt: '2026-07-01T12:00:00Z', // Newer
      content: [
        { id: '1', value: 'Apple', checked: false, depth: 0, parentId: null }
      ]
    };

    const serverList: List = {
      id: 'list-1',
      title: 'Shopping List',
      createdAt: '2026-07-01T11:00:00Z',
      updatedAt: '2026-07-01T11:00:00Z', // Older
      content: [
        { id: '1', value: 'Banana', checked: false, depth: 0, parentId: null }
      ]
    };

    const winner = await syncEngine.resolveConflict(localList, serverList);
    expect(winner.content[0].value).toBe('Apple');
  });

  it('should keep server version when timestamp is newer', async () => {
    const localList: List = {
      id: 'list-2',
      title: 'Shopping List',
      updatedAt: '2026-07-01T11:00:00Z', // Older
      content: [{ id: '1', value: 'Apple', checked: false, depth: 0, parentId: null }]
    };

    const serverList: List = {
      id: 'list-2',
      title: 'Shopping List',
      updatedAt: '2026-07-01T12:00:00Z', // Newer
      content: [{ id: '1', value: 'Banana', checked: false, depth: 0, parentId: null }]
    };

    const winner = await syncEngine.resolveConflict(localList, serverList);
    expect(winner.content[0].value).toBe('Banana');
  });

  it('should fall back to createdAt when updatedAt is missing', async () => {
    const localList: List = {
      id: 'list-3',
      title: 'Shopping List',
      createdAt: '2026-07-01T12:00:00Z', // Newer
      content: [{ id: '1', value: 'Apple', checked: false, depth: 0, parentId: null }]
    };

    const serverList: List = {
      id: 'list-3',
      title: 'Shopping List',
      createdAt: '2026-07-01T11:00:00Z', // Older
      content: [{ id: '1', value: 'Banana', checked: false, depth: 0, parentId: null }]
    };

    const winner = await syncEngine.resolveConflict(localList, serverList);
    expect(winner.content[0].value).toBe('Apple');
  });
});