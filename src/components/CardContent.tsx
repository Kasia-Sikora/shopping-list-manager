import { useCallback, useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { List, SetLocalDataActions } from '../interfaces';
import { useActiveCardIdStore, useStore } from '../stores/store';
import { generateId, setFocusOnElement, splitItemsToDoneAndUndoneLists } from '../utils/utils';
import AddListItemButton from './atoms/AddListItemButton';
import { ChevronButton } from './atoms/ChevronButton';
import MenuButton from './atoms/MenuButton';
import ListOfItems from './ListOfItems';
import { EMPTY_CARD_ID } from '../consts';
import { dbActions } from '../utils/storeUtils';

interface CardContentProps {
  editedList: List;
  cardRef: RefObject<HTMLDivElement | null>;
  cardDataId: string;
  cardId: string;
  actions: SetLocalDataActions
}

const CardContent = ({ editedList, cardRef, cardDataId, cardId, actions }: CardContentProps) => {
  const { editingCardId } = useActiveCardIdStore()
  const { removeList } = useStore()

  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(editedList.content);
  const [contentExpanded, setContentExpanded] = useState<boolean>(true);
  const doneTaskQuantity = checkedItems.length;

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setContentExpanded((expanded) => !expanded);
  };

  const handleSubmit = useCallback(() => {
    if (!editingCardId) return;
    const activeEl = document.activeElement
    if (activeEl instanceof HTMLElement) activeEl.blur()
    const data = { ...editedList, content: editedList.content.filter(item => item.value) }
    if (data.title || data.content.length) {
      actions.save(data)
    } else {
      removeList(data.id)
      try {
        dbActions({ action: "delete", data: { id: data.id } })
      } catch (error) {
        console.error('Failed to delete list:', error);
      }
      actions.resetLocalState()
    }
  }, [editingCardId, editedList, actions, removeList]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingCardId === cardId) {
        if (cardRef?.current && !cardRef.current.contains(e.target as Node)) {
          handleSubmit();
        }
        // resetStates();
      };
      const dropdownCardEl = document.querySelector(`[data-id='card-${editedList.id}'] #dropdown`)
      if (dropdownCardEl && !dropdownCardEl.contains(e.target as Node)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('mouseup', handleClickOutside);

    return () => document.removeEventListener('mouseup', handleClickOutside);
  }, [cardRef, handleSubmit, setOpenMenu, editedList.id, editingCardId, cardId]);

  const handleCreateNewLine = (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    let indexOfActiveEl: number;
    let itemDepth = 0
    let parentId = null;
    if (e?.target instanceof HTMLTextAreaElement) {
      const target = e.target instanceof HTMLTextAreaElement ? e.target.name : undefined;
      if (e.nativeEvent instanceof KeyboardEvent && target) {
        const targetId = target.split('.')[0];
        indexOfActiveEl = editedList.content.findIndex(item => item.id === targetId)
        itemDepth = parseInt(e.target.dataset.depth ?? '0')
      } else {
        indexOfActiveEl = editedList.content.length - 1;
      }
    }
    else {
      indexOfActiveEl = editedList.content.length - 1;
    }
    if (itemDepth > 0) {
      parentId = editedList.content[indexOfActiveEl - 1]?.id ?? null
    }
    const newItem = { id: generateId(), value: '', checked: false, depth: itemDepth, parentId: parentId };
    const newData = [...editedList.content]
    newData.splice(indexOfActiveEl + 1, 0, newItem)
    actions.update({ ...editedList, content: newData });
    setTimeout(() => setFocusOnElement(cardId, newItem.id), 0)
  };

  const handleFormEvents = (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!e) return;

    if (editingCardId === cardId && cardRef.current) {
      const isKeyboardEvent = e.nativeEvent instanceof KeyboardEvent && 'key' in e;

      // Escape or Shift+Enter → submit and exit
      if (isKeyboardEvent && (e.key === 'Escape' || (e.key === 'Enter' && e.shiftKey))) {
        e.preventDefault();
        setTimeout(() => handleSubmit(), 0);
        return;
      }

      // Arrow Up/Down → navigate through textareas
      if (isKeyboardEvent && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
        e.preventDefault();
        const textareas = Array.from(
          document.querySelectorAll(`[data-testid='${cardDataId}'] textarea`)
        ) as HTMLTextAreaElement[];
        const currentIndex = textareas.indexOf(e.target as HTMLTextAreaElement);

        if (currentIndex !== -1) {
          const nextIndex = e.key === 'ArrowUp' ? currentIndex - 1 : currentIndex + 1;
          if (nextIndex >= 0 && nextIndex < textareas.length) {
            textareas[nextIndex].focus();
          }
        }
        return;
      }

      // Enter → create new line
      if (isKeyboardEvent && e.key === 'Enter') {
        e.preventDefault();
        handleCreateNewLine(e);
      }
    }
  };

  return (
    <>
      <form onKeyDown={handleFormEvents}>
        <div className="flex flex-col align-baseline gap-2">
          {editingCardId === cardId ? (
            <textarea
              className={`pb-2 text-2xl font-bold border-0 text-secondary resize-none overflow-hidden field-sizing-content ${(editingCardId === cardId || editedList) ? '' : 'hidden'}`}
              value={editedList?.title || ''}
              onChange={(e) => actions.update({ title: e.target?.value })}
              placeholder="Tytuł..."
              name='title'
            />
          ) : (
            cardId !== EMPTY_CARD_ID && <h2 className="pb-2 text-2xl wrap-break-word font-bold border-0 text-secondary">{editedList.title || "Untitled"}</h2>
          )}
          {uncheckedItems.length > 0 && (
            <ListOfItems
              listId={editedList?.id}
              list={uncheckedItems}
              checkedItems={false}
              actions={actions}
              editedList={editedList}
              cardDataId={cardDataId}
            />
          )}
          {(editingCardId === cardId || cardId !== EMPTY_CARD_ID) && <AddListItemButton handleCreateNewLine={handleCreateNewLine} />}
          {doneTaskQuantity > 0 && (
            <>
              <div className="border-t border-primary w-full" />
              <ChevronButton toggle={toggleExpand} contentExpanded={contentExpanded} quantity={doneTaskQuantity} />
              {contentExpanded && (
                <ListOfItems
                  listId={editedList?.id}
                  list={checkedItems}
                  checkedItems={true}
                  actions={actions}
                  editedList={editedList}
                  cardDataId={cardDataId}
                />
              )}
            </>
          )}
        </div>
      </form>
      {cardId !== EMPTY_CARD_ID && <MenuButton cardId={editedList.id} openMenu={openMenu} setOpenMenu={setOpenMenu} list={editedList} actions={actions} />}
    </>
  );
};

export default CardContent;
