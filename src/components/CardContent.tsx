import { useCallback, useEffect, useState } from 'react';
import type { List, SetLocalDataActions } from '../interfaces';
import { useActiveCardIdStore, useStore } from '../stores/store';
import { generateId, handleKeyDown, setFocusOnElement, splitItemsToDoneAndUndoneLists } from '../utils/utils';
import AddListItemButton from './atoms/AddListItemButton';
import { ChevronButton } from './atoms/ChevronButton';
import MenuButton from './atoms/MenuButton';
import ListOfItems from './ListOfItems';
import { EMPTY_CARD_ID } from '../consts';

interface CardContentProps {
  editedList: List;
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardDataId: string;
  cardIndex: number
  cardId: string | null,
  actions: SetLocalDataActions
}

const CardContent = ({ editedList, cardRef, cardDataId, cardIndex, cardId, actions }: CardContentProps) => {
  const { editingCardId, setEditingCardId } = useActiveCardIdStore()
  const { removeList } = useStore()


  const [openMenu, setOpenMenu] = useState<boolean>(false)
  const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(editedList.content);
  const [contentExpanded, setContentExpanded] = useState<boolean>(true);
  const doneTaskQuantity = checkedItems.length;

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setContentExpanded((expanded) => !expanded);
  };

  useEffect(() => {
    if (editingCardId === cardId) {
      const container = document.querySelector(`[data-testid='${cardDataId}']`);


      const onKeyDown = (e: KeyboardEvent) => {
        //todo edc is not clearing the empty items
        if (e.key === "Escape") {
          setEditingCardId(null)
          const activeEl = document.activeElement
          if (activeEl instanceof HTMLElement) {
            activeEl.blur()
          }
        }
        if (!e || !(e.target as HTMLTextAreaElement).name) return;

        const currentListItems = document.querySelectorAll(
          `[data-testid='${cardDataId}'] textarea`
        ) as NodeListOf<HTMLTextAreaElement>;
        handleKeyDown(e, Array.from(currentListItems));
      };

      container.addEventListener('keydown', onKeyDown);
      return () => container.removeEventListener('keydown', onKeyDown);
    }
  }, [cardDataId, cardId, editingCardId, editedList.content, setEditingCardId]);

  const handleSubmit = useCallback(() => {
    if (!editingCardId) return;
    const data = { ...editedList, content: editedList.content.filter(item => item.value) }
    if (data.title || data.content.length) {
      actions.save(data)
    } else {
      removeList(data.id)
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
    if (e?.target instanceof HTMLTextAreaElement) {
      const target = e.target instanceof HTMLTextAreaElement ? e.target.name : undefined;
      if (e.nativeEvent instanceof KeyboardEvent && target) {
        const targetId = target.split('.')[0];
        indexOfActiveEl = editedList.content.findIndex(item => item.id === targetId)
        itemDepth = parseInt(e.target.dataset.depth ?? '0')
      }
    }
    else {
      indexOfActiveEl = editedList.content.length - 1;
    }
    const newItem = { id: generateId(), value: '', checked: false, depth: itemDepth };
    const newData = [...editedList.content]
    newData.splice(indexOfActiveEl + 1, 0, newItem)
    actions.update({ ...editedList, content: newData });
    setTimeout(() => setFocusOnElement(cardId, newItem.id), 0)
  };

  const handleFormEvents = (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!e) return;
    if (editingCardId === cardId && cardRef.current) {
      const isETypeOfKeyboardEvent = e.nativeEvent instanceof KeyboardEvent && 'key' in e && e.key === 'Enter';
      if (isETypeOfKeyboardEvent && e.shiftKey) {
        e.preventDefault();
        setTimeout(() => handleSubmit(), 0);
        // resetStates();
      } else if (isETypeOfKeyboardEvent || e.nativeEvent instanceof PointerEvent) {
        e.preventDefault();
        handleCreateNewLine(e);
      }
    }
  };

  return (
    <>
      <form onKeyDown={handleFormEvents}>
        <div className="flex flex-col align-baseline gap-2">
          {(editingCardId !== cardId || (editingCardId !== cardId && cardId === EMPTY_CARD_ID)) ? (
            editedList.title && <h2 className="pb-2 text-2xl wrap-break-word font-bold border-0 text-secondary">{editedList.title}</h2>
          ) : (
            <textarea
              className={`pb-2 text-2xl font-bold border-0 text-secondary resize-none overflow-hidden field-sizing-content ${(editingCardId === cardId || editedList) ? '' : 'hidden'}`}
              value={editedList?.title || ''}
              onChange={(e) => actions.update({ title: e.target?.value })}
              placeholder="Tytuł..."
              name='title'
            />)}
          {uncheckedItems.length > 0 && (
            <ListOfItems
              listId={editedList?.id}
              list={uncheckedItems}
              checkedItems={false}
              cardIndex={cardIndex}
              actions={actions}
              editedList={editedList}
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
                  cardIndex={cardIndex}
                  actions={actions}
                  editedList={editedList}
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
