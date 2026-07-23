import type { DisplayItem, ListItem } from '../interfaces';

type DividedLists = { uncheckedItems: DisplayItem[]; checkedItems: DisplayItem[] };

export const generateId = () => {
  return crypto.randomUUID();
};

// Reorder a flat list so each parent is immediately followed by its whole subtree (depth-first),
// with siblings keeping their original order. The rendered lists nest by depth + array position, so
// this canonical order is what makes them correct regardless of how `content` was stored — the drag
// (`onDragEnd` prepends checked items) and in-place check/uncheck can scramble `content` freely; the
// split re-derives clean tree order every render.
const orderByTree = (items: ListItem[]): ListItem[] => {
  const byParent = new Map<string | null, ListItem[]>();
  for (const item of items) {
    const key = item.parentId ?? null;
    byParent.set(key, [...(byParent.get(key) ?? []), item]);
  }

  const ordered: ListItem[] = [];
  const walk = (parentId: string | null) => {
    for (const item of byParent.get(parentId) ?? []) {
      ordered.push(item);
      walk(item.id);
    }
  };
  walk(null);

  // Safety: if an item has a dangling parentId, it's never reached by the walk — append it so
  // nothing is silently dropped.
  return ordered.length === items.length ? ordered : [...ordered, ...items.filter((i) => !ordered.includes(i))];
};

export const splitItemsToDoneAndUndoneLists = (rawItems: ListItem[]): DividedLists => {
  const items = orderByTree(rawItems);
  const uncheckedItems: DisplayItem[] = [];
  const checkedItems: DisplayItem[] = [];
  const emittedHeaders = new Set<string>();

  const byId = new Map<string, ListItem>();
  for (const item of items) byId.set(item.id, item);

  const checkedChildrenByParent = new Map<string, ListItem[]>();
  for (const item of items) {
    if (!item.checked || item.depth === 0) continue;
    if (!item.parentId) continue;
    const siblings = checkedChildrenByParent.get(item.parentId) ?? [];
    siblings.push(item);
    checkedChildrenByParent.set(item.parentId, siblings);
  }

  const setParentId = (item: ListItem) => {
    if (item.depth === 0) return null;
    return item.parentId;
  };

  for (const item of items) {
    const itemWithRelations = {
      ...item,
      parentId: setParentId(item),
    };

    if (!item.checked) {
      uncheckedItems.push(itemWithRelations);
      continue;
    }

    if (!item.depth) {
      if (emittedHeaders.has(item.id)) continue;
      checkedItems.push(item);
      for (const child of checkedChildrenByParent.get(item.id) ?? []) {
        checkedItems.push(child);
      }
      emittedHeaders.add(item.id);
    } else {
      if (!item.parentId) {
        checkedItems.push({ ...item, depth: 0, parentId: null });
        continue;
      }
      const parent = byId.get(item.parentId);
      if (!parent) {
        checkedItems.push({ ...item, depth: 0, parentId: null });
        continue;
      }
      const headerId = parent.checked ? parent.id : `shadow-${parent.id}`;
      if (emittedHeaders.has(headerId)) continue;
      emittedHeaders.add(headerId);

      checkedItems.push({ ...parent, checked: true, id: headerId, isShadow: !parent.checked });
      for (const child of checkedChildrenByParent.get(parent.id) ?? []) {
        checkedItems.push(child);
      }
    }
  }

  return { uncheckedItems, checkedItems };
};
