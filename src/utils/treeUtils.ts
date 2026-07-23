import { MAX_LIST_DEPTH } from '../consts';
import type { DisplayItem, ListItem } from '../interfaces';

export function getDescendants(items: ListItem[], parentId: string): Set<string> {
  const directChildren = items.filter((item) => item.parentId === parentId);

  return directChildren.reduce((descendants, child) => {
    return new Set([...descendants, child.id, ...getDescendants(items, child.id)]);
  }, new Set<string>());
}

export function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: ListItem[],
  targetId: string,
  projectedDepth: number,
  maxAllowedDepth: number = MAX_LIST_DEPTH,
) {
  const targetItemIndex = items.findIndex(({ id }) => id === targetId);
  const previousItem = items[targetItemIndex - 1];
  const targetItem = items[targetItemIndex];
  const nextItem = items[targetItemIndex + 1];
  const maxDepth = Math.min(getMaxDepth(targetItem, previousItem), maxAllowedDepth);
  const minDepth = getMinDepth(nextItem);
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }

  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = items
      .slice(0, targetItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

export const getMaxDepth = (targetItem: ListItem, previousItem: ListItem | undefined) => {
  if (!previousItem) return 0;

  return Math.min(targetItem.depth + 1, previousItem.depth + 1, MAX_LIST_DEPTH);
};

export const getMinDepth = (nextItem: ListItem) => {
  return nextItem ? nextItem.depth : 0;
};

export const buildTree = (list: DisplayItem[], children: ListItem[]) => {
  const tree = [...list].filter((i) => !i.isShadow);
  let addedChildren = 0;
  for (const element of children) {
    const { parentId } = element;
    const parentIndex = tree.findIndex((el) => el.id === parentId);

    if (parentIndex === -1) continue;

    tree.splice(parentIndex + 1 + addedChildren, 0, element);
    addedChildren += 1;
  }

  return tree;
};
