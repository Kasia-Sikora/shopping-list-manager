import { describe, it, expect } from 'vitest';
import { isValidTreeOrder, ensureTreeOrder } from '../treeValidation';
import type { ListItem } from '../../interfaces';

describe('treeValidation', () => {
  describe('isValidTreeOrder', () => {
    it('should return true for empty array', () => {
      expect(isValidTreeOrder([])).toBe(true);
    });

    it('should return true for single root item', () => {
      const items: ListItem[] = [
        { id: 'a', value: '', checked: false, depth: 0, parentId: null }
      ];
      expect(isValidTreeOrder(items)).toBe(true);
    });

    it('should return true when all parents appear before children', () => {
      const items: ListItem[] = [
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a' },
        { id: 'c', value: '', checked: false, depth: 1, parentId: 'a' },
        { id: 'd', value: '', checked: false, depth: 2, parentId: 'b' },
      ];
      expect(isValidTreeOrder(items)).toBe(true);
    });

    it('should return true for multiple root items with valid order', () => {
      const items: ListItem[] = [
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a' },
        { id: 'c', value: '', checked: false, depth: 0, parentId: null },
        { id: 'd', value: '', checked: false, depth: 1, parentId: 'c' },
      ];
      expect(isValidTreeOrder(items)).toBe(true);
    });

    it('should return false when child appears before parent', () => {
      const items: ListItem[] = [
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a' },
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
      ];
      expect(isValidTreeOrder(items)).toBe(false);
    });

    it('should return false when grandchild before parent', () => {
      const items: ListItem[] = [
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
        { id: 'c', value: '', checked: false, depth: 2, parentId: 'b' },
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a' },
      ];
      expect(isValidTreeOrder(items)).toBe(false);
    });

    it('should return false when middle child before parent', () => {
      const items: ListItem[] = [
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
        { id: 'c', value: '', checked: false, depth: 1, parentId: 'a' },
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a' },
      ];
      // c and b are siblings, but b's parent is seen, so this is valid
      expect(isValidTreeOrder(items)).toBe(true);
    });

    it('should return false when parent reference points to non-existent item', () => {
      const items: ListItem[] = [
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a-does-not-exist' },
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
      ];
      expect(isValidTreeOrder(items)).toBe(false);
    });

    it('should handle deep nesting', () => {
      const items: ListItem[] = [
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a' },
        { id: 'c', value: '', checked: false, depth: 2, parentId: 'b' },
        { id: 'd', value: '', checked: false, depth: 3, parentId: 'c' },
        { id: 'e', value: '', checked: false, depth: 4, parentId: 'd' },
      ];
      expect(isValidTreeOrder(items)).toBe(true);
    });

    it('should fail when deep nesting is out of order', () => {
      const items: ListItem[] = [
        { id: 'e', value: '', checked: false, depth: 4, parentId: 'd' },
        { id: 'd', value: '', checked: false, depth: 3, parentId: 'c' },
        { id: 'c', value: '', checked: false, depth: 2, parentId: 'b' },
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a' },
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
      ];
      expect(isValidTreeOrder(items)).toBe(false);
    });
  });

  describe('ensureTreeOrder', () => {
    it('should return same reference if already valid', () => {
      const items: ListItem[] = [
        { id: 'a', value: '', checked: false, depth: 0, parentId: null },
        { id: 'b', value: '', checked: false, depth: 1, parentId: 'a' },
      ];
      const result = ensureTreeOrder(items);
      expect(result).toBe(items); // Same reference
    });

    it('should reorder when child before parent', () => {
      const items: ListItem[] = [
        { id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' },
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
      ];
      const result = ensureTreeOrder(items);

      expect(result).toEqual([
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
        { id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' },
      ]);
    });

    it('should reorder complex tree with multiple roots', () => {
      const items: ListItem[] = [
        { id: 'c', value: 'C', checked: false, depth: 1, parentId: 'a' },
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
        { id: 'd', value: 'D', checked: false, depth: 1, parentId: 'b' },
        { id: 'b', value: 'B', checked: false, depth: 0, parentId: null },
      ];
      const result = ensureTreeOrder(items);

      expect(result).toEqual([
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
        { id: 'c', value: 'C', checked: false, depth: 1, parentId: 'a' },
        { id: 'b', value: 'B', checked: false, depth: 0, parentId: null },
        { id: 'd', value: 'D', checked: false, depth: 1, parentId: 'b' },
      ]);
    });

    it('should reorder deep nesting from end to start', () => {
      const items: ListItem[] = [
        { id: 'e', value: 'E', checked: false, depth: 4, parentId: 'd' },
        { id: 'd', value: 'D', checked: false, depth: 3, parentId: 'c' },
        { id: 'c', value: 'C', checked: false, depth: 2, parentId: 'b' },
        { id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' },
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
      ];
      const result = ensureTreeOrder(items);

      expect(result).toEqual([
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
        { id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' },
        { id: 'c', value: 'C', checked: false, depth: 2, parentId: 'b' },
        { id: 'd', value: 'D', checked: false, depth: 3, parentId: 'c' },
        { id: 'e', value: 'E', checked: false, depth: 4, parentId: 'd' },
      ]);
    });

    it('should handle siblings with scrambled order', () => {
      const items: ListItem[] = [
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
        { id: 'c', value: 'C', checked: false, depth: 1, parentId: 'a' },
        { id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' },
      ];
      const result = ensureTreeOrder(items);

      // Order should preserve depth-first traversal: a, then children of a (c, b in order)
      expect(result[0]).toEqual({ id: 'a', value: 'A', checked: false, depth: 0, parentId: null });
      expect(result.slice(1)).toContainEqual({ id: 'c', value: 'C', checked: false, depth: 1, parentId: 'a' });
      expect(result.slice(1)).toContainEqual({ id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' });
    });

    it('should not mutate original array', () => {
      const items: ListItem[] = [
        { id: 'b', value: 'B', checked: false, depth: 1, parentId: 'a' },
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
      ];
      const original = JSON.parse(JSON.stringify(items));

      ensureTreeOrder(items);

      expect(items).toEqual(original);
    });

    it('should handle empty array', () => {
      const emptyArray: ListItem[] = [];
      const result = ensureTreeOrder(emptyArray);
      expect(result).toEqual([]);
      expect(result).toBe(emptyArray); // Same reference
    });

    it('should handle single item', () => {
      const items: ListItem[] = [
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null }
      ];
      const result = ensureTreeOrder(items);
      expect(result).toBe(items); // Same reference
    });

    it('should preserve item data during reordering', () => {
      const items: ListItem[] = [
        { id: 'b', value: 'Item B', checked: true, depth: 2, parentId: 'a' },
        { id: 'a', value: 'Item A', checked: false, depth: 0, parentId: null },
      ];
      const result = ensureTreeOrder(items);

      const itemB = result.find(item => item.id === 'b');
      expect(itemB).toEqual({
        id: 'b',
        value: 'Item B',
        checked: true,
        depth: 2,
        parentId: 'a'
      });
    });

    it('should handle tree with missing parent reference (orphaned items)', () => {
      const items: ListItem[] = [
        { id: 'a', value: 'A', checked: false, depth: 0, parentId: null },
        { id: 'orphan', value: 'Orphan', checked: false, depth: 1, parentId: 'non-existent' },
      ];
      const result = ensureTreeOrder(items);

      // Orphan should come after parent (even though parent doesn't exist)
      expect(result[0].id).toBe('a');
      expect(result[1].id).toBe('orphan');
    });

    it('should handle complex real-world scenario', () => {
      // Simulates user performing multiple drag operations that scrambled tree
      const items: ListItem[] = [
        { id: 'grandchild-2', value: 'GC2', checked: false, depth: 2, parentId: 'child-1' },
        { id: 'root-2', value: 'Root2', checked: false, depth: 0, parentId: null },
        { id: 'child-2', value: 'C2', checked: false, depth: 1, parentId: 'root-2' },
        { id: 'child-1', value: 'C1', checked: false, depth: 1, parentId: 'root-1' },
        { id: 'grandchild-1', value: 'GC1', checked: false, depth: 2, parentId: 'child-1' },
        { id: 'root-1', value: 'Root1', checked: false, depth: 0, parentId: null },
      ];

      const result = ensureTreeOrder(items);

      // Verify all parents come before children
      expect(isValidTreeOrder(result)).toBe(true);

      // Verify all items are present
      expect(result.length).toBe(6);
      expect(result.map(i => i.id)).toContain('root-1');
      expect(result.map(i => i.id)).toContain('root-2');
      expect(result.map(i => i.id)).toContain('child-1');
      expect(result.map(i => i.id)).toContain('child-2');
      expect(result.map(i => i.id)).toContain('grandchild-1');
      expect(result.map(i => i.id)).toContain('grandchild-2');
    });
  });
});
