import { MAX_LIST_DEPTH } from "../consts";
import type { ListItem, ListItemWithRelations } from "../interfaces";

export const getSubtreeCount = (items: ListItem[], startIndex: number) => {
  const parentDepth = items[startIndex].depth;
  let count = 0;
  for (let i = startIndex + 1; i < items.length; i++) {
    if (items[i].depth > parentDepth) {
      count++;
    } else {
      break;
    }
  }
  return count;
};


export function getDescendants(items: ListItemWithRelations[], parentId: string): Set<string> {
  const directChildren = items.filter((item) => item.parentId === parentId);

  return directChildren.reduce((descendants, child) => {
    return new Set([...descendants, child.id, ...getDescendants(items, child.id)]);
  }, new Set<string>());
}

export function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(items: ListItemWithRelations[], targetId: string, projectedDepth: number) {
  const targetItemIndex = items.findIndex(({ id }) => id === targetId);
  const previousItem = items[targetItemIndex - 1];
  const targetItem = items[targetItemIndex];
  const nextItem = items[targetItemIndex + 1];
  const maxDepth = getMaxDepth(targetItem, previousItem);
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

export const buildTree = (list: ListItemWithRelations[], children: ListItemWithRelations[]) => {
  const tree = [...list];

  for (let i = 0; i < children.length; i++) {
    const { parentId } = children[i];
    const parentIndex = tree.findIndex((el) => el.id === parentId);

    if (!parentIndex && parentIndex !== 0) continue;

    tree.splice(parentIndex+1, 0, children[i]);
  }

  return tree;
};
