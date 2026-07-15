import type { ListItem } from '../interfaces';

export const generateId = () => {
  return crypto.randomUUID();
};

export const splitItemsToDoneAndUndoneLists = (items: ListItem[]) => {
  const uncheckedItems: ListItem[] = [];
  const checkedItems: ListItem[] = [];
  let checkedParentId: string | null = null;
  let uncheckedParentId: string | null = null;

  const setParentId = (item: ListItem) => {
    if (item.depth === 0) return null;
    return item.checked ? checkedParentId : uncheckedParentId;
  };

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isNextItemRoot = i < items.length - 1 && items[i + 1].depth === 0;
    const shouldResetParent = item.depth === 0 && (isNextItemRoot || i === items.length - 1);

    const itemWithRelations = {
      ...item,
      parentId: setParentId(item),
    };

    if (item.checked) {
      checkedItems.push(itemWithRelations);
      if (item.depth === 0 && !shouldResetParent) {
        checkedParentId = item.id;
      } else if (shouldResetParent) {
        checkedParentId = null;
      }
    } else {
      uncheckedItems.push(itemWithRelations);
      if (item.depth === 0 && !shouldResetParent) {
        uncheckedParentId = item.id;
      } else if (shouldResetParent) {
        uncheckedParentId = null;
      }
    }
  }

  return { uncheckedItems, checkedItems };
};

export const handleKeyDown = (e: KeyboardEvent, list: Element[]) => {
  if (!list?.length) return;
  const elem = e.target as HTMLTextAreaElement;
  const indexOfCurrEl = list.indexOf(elem);

  let focusedEl;
  if (e.key === 'ArrowDown') {
    focusedEl = list[indexOfCurrEl + 1] as HTMLTextAreaElement;
  } else if (e.key === 'ArrowUp') {
    focusedEl = list[indexOfCurrEl - 1] as HTMLTextAreaElement;
  }
  if (focusedEl) focusedEl.focus();
};
