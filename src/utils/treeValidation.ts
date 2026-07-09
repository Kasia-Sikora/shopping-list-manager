import type { ListItem } from '../interfaces';

/**
 * Check if items array maintains tree order (parents before children)
 * Returns true if valid, false if needs reordering
 *
 * @example
 * // Valid: parent appears before child
 * const items = [
 *   { id: 'a', depth: 0, parentId: null },
 *   { id: 'b', depth: 1, parentId: 'a' },
 * ]
 * isValidTreeOrder(items) // true
 *
 * // Invalid: child appears before parent
 * const items = [
 *   { id: 'b', depth: 1, parentId: 'a' },
 *   { id: 'a', depth: 0, parentId: null },
 * ]
 * isValidTreeOrder(items) // false
 */
export function isValidTreeOrder(items: ListItem[]): boolean {
  const seenIds = new Set<string>();

  for (const item of items) {
    if (item.parentId && !seenIds.has(item.parentId)) {
      return false; // Parent not yet seen
    }
    seenIds.add(item.id);
  }

  return true;
}

/**
 * Reorder items so all parents appear before their children (depth-first)
 * If already valid, returns same array reference
 *
 * @example
 * // Invalid order → Valid order
 * const items = [
 *   { id: 'b', depth: 1, parentId: 'a' },
 *   { id: 'a', depth: 0, parentId: null },
 *   { id: 'c', depth: 1, parentId: 'a' },
 * ]
 * const reordered = ensureTreeOrder(items)
 * // Result: [
 * //   { id: 'a', depth: 0, parentId: null },
 * //   { id: 'b', depth: 1, parentId: 'a' },
 * //   { id: 'c', depth: 1, parentId: 'a' },
 * // ]
 */
export function ensureTreeOrder(items: ListItem[]): ListItem[] {
  // Fast path: already valid
  if (isValidTreeOrder(items)) {
    return items;
  }

  const ordered: ListItem[] = [];
  const visited = new Set<string>();

  // Process items, adding each with all ancestors first (depth-first)
  function addWithAncestors(item: ListItem) {
    if (visited.has(item.id)) return;

    // Add parent first if exists
    if (item.parentId) {
      const parent = items.find(i => i.id === item.parentId);
      if (parent) {
        addWithAncestors(parent);
      }
    }

    visited.add(item.id);
    ordered.push(item);
  }

  // Process each item in original order
  for (const item of items) {
    addWithAncestors(item);
  }

  return ordered;
}
