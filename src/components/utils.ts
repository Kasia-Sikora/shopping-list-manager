import type { FieldArrayWithId } from 'react-hook-form';
import type { List, ListItem } from '../interfaces';

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

const getFocusedElement = (id: string, selector: string) => {
  return document.querySelector(`[data-id='${id}'] ${selector}`) as HTMLTextAreaElement;
};

export const handleKeyDown = (e: KeyboardEvent, cardId: string) => {
  const elem = e.target as HTMLTextAreaElement;
  const listArr = Array.from(document.querySelectorAll(`[data-id='${cardId}'] textarea`));
  const indexOfCurrEl = listArr.indexOf(elem);
  let focusedEl;
  if (e.key === 'ArrowDown') {
    if (indexOfCurrEl < 0) {
      focusedEl = getFocusedElement(cardId, "[name='title']") as HTMLTextAreaElement;
    } else if (indexOfCurrEl < listArr.length - 1) {
      focusedEl = listArr[indexOfCurrEl + 1] as HTMLTextAreaElement;
    }
  } else if (e.key === 'ArrowUp') {
    if (indexOfCurrEl < listArr.length) {
      focusedEl = listArr[indexOfCurrEl - 1] as HTMLTextAreaElement;
    } else {
      focusedEl = listArr[listArr.length - 1] as HTMLTextAreaElement;
    }
  }

  if (focusedEl) focusedEl.focus();
};