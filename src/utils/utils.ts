import type { FieldArrayWithId } from 'react-hook-form';
import type { FieldListItem, List, ListItem, PersistedShoppingListStore } from '../interfaces';

export const generateId = () => {
  return crypto.randomUUID();
};

export const splitItemsToDoneAndUndoneLists = (items: (FieldArrayWithId<List, 'content', 'id'>)[]) => {
  const uncheckedItems: FieldListItem[] = [];
  const checkedItems: FieldListItem[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const itemWithId = { ...item, globalArrayIndex: i, id: item.id ?? '' } as FieldListItem;
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

export const sortCards = (storage: PersistedShoppingListStore) => {
  return storage.state?.items ? storage.state.items.map((item) => ({ ...item, content: sortList(item.content) })) : [];
};
