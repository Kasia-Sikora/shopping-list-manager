import type { FieldArrayWithId } from 'react-hook-form';
import type { List, ListItem, PersistedShoppingListStore } from '../interfaces';

export const generateId = () => {
  return crypto.randomUUID();
};

export const splitItemsToDoneAndUndoneLists = (items: FieldArrayWithId<List, 'content', 'id'>[] | ListItem[]) => {
  const uncheckedItems = [];
  const checkedItems = [];

  for (let i = 0; i < items.length; i++) {
    if (items[i].checked) {
      checkedItems.push({ ...items[i], fieldArrayId: i });
    } else {
      uncheckedItems.push({ ...items[i], fieldArrayId: i });
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

export const sortCards = (storage: PersistedShoppingListStore) => {
  return storage.state?.items ? storage.state.items.map((item) => ({ ...item, content: sortList(item.content) })) : [];
};
