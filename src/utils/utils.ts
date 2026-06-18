import type { ListItem, PersistedShoppingListStore } from '../interfaces';

export const generateId = () => {
  return crypto.randomUUID();
};

export const splitItemsToDoneAndUndoneLists = (items: ListItem[]) => {
  const uncheckedItems: ListItem[] = [];
  const checkedItems: ListItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemWithId = { ...item, id: item.id ?? '' };
    if (item.checked) {
      checkedItems.push(itemWithId);
    } else {
      uncheckedItems.push(itemWithId);
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

export const setFocusOnElement = (cardId: string, indexOfActiveEl: number) => {
  requestAnimationFrame(() => {
    const focusEl = document.querySelector(`[data-id="card-${cardId}"] [name="content.${indexOfActiveEl + 1}.value"]`);
    if (focusEl && focusEl instanceof HTMLTextAreaElement) focusEl.focus();
  });
};
