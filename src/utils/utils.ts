import type { ListItem, ListItemWithRelations, PersistedShoppingListStore } from '../interfaces';

export const generateId = () => {
  return crypto.randomUUID();
};

export const splitItemsToDoneAndUndoneLists = (items: ListItem[]) => {
  const uncheckedItems: ListItemWithRelations[] = [];
  const checkedItems: ListItemWithRelations[] = [];
  let checkedParentId: string | null = null;
  let uncheckedParentId: string | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const isNextItemRoot = i < items.length - 1 && items[i + 1].depth === 0;
    const shouldResetParent = item.depth === 0 && (isNextItemRoot || i === items.length - 1);

    const itemWithRelations = {
      ...item,
      parentId: item.depth === 0 ? null : (item.checked ? checkedParentId : uncheckedParentId),
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
  if (!list || !list.length) return;
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

export const sortList = (list: ListItem[]) => {
  if (!list) return [];
  const uncheckedList = list.filter((item) => !item.checked);
  const checkedItems = list.filter((item) => item.checked);
  return [...uncheckedList, ...checkedItems];
};

export const sortListContent = (storage: PersistedShoppingListStore) => {
  return storage.state?.lists ? storage.state.lists.map((item) => ({ ...item, content: sortList(item.content) })) : [];
};

export const setFocusOnElement = (cardId: string, itemId: string) => {
  requestAnimationFrame(() => {
    const focusEl = document.querySelector(`[data-id="card-${cardId}"] [name="${itemId}.value"]`);
    if (focusEl && focusEl instanceof HTMLTextAreaElement) focusEl.focus();
  });
};
