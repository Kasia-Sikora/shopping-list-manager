import type { FieldArrayWithId } from 'react-hook-form';
import type { List, ListItem } from '../interfaces';

export const generateId = () => {
  return crypto.randomUUID();
}

export const splitItemsToDoneAndUndoneLists = (items: FieldArrayWithId<List, 'content', 'id'>[] | ListItem[]) => {
  const uncheckedItems = [];
  const checkedItems = [];

  for (let i = 0; i < items.length; i++) {
    if (items[i].checked) {
      checkedItems.push({ ...items[i], index: i });
    } else {
      uncheckedItems.push({ ...items[i], index: i });
    }
  }

  return { uncheckedItems, checkedItems };
};

const getFocusedElement = (id: string, selector: string) => {
  return document.querySelector(`[data-id='${id}'] ${selector}`) as HTMLTextAreaElement;
};

export const handleKeyDown = (e: KeyboardEvent, cardId: string) => {
  const elName = (e.target as HTMLTextAreaElement).name;
  const indexOfEl: number = parseInt(elName.split('.')[1]);
  let focusedEl;
  if (e.key === 'ArrowDown') {
    if (isNaN(indexOfEl)) {
      focusedEl = getFocusedElement(cardId, "[name='content.0.value']");
    } else {
      const indexOfNextEl = indexOfEl + 1;
      focusedEl = getFocusedElement(cardId, `[name='content.${indexOfNextEl}.value']`);
    }
  } else if (e.key === 'ArrowUp') {
    if (indexOfEl === 0) {
      focusedEl = getFocusedElement(cardId, "[name='title']");
    } else {
      const indexOfPrevEl = indexOfEl - 1;
      focusedEl = getFocusedElement(cardId, `[name='content.${indexOfPrevEl}.value']`);
    }
  }
  if (focusedEl) focusedEl.focus();
};
//ustaw karete na koniec linijki jeśli jest text
//poruszanie sie po podzielonej liście nie działa dobrze
