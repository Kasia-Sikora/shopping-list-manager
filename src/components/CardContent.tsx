import { useCallback, useEffect, useMemo, useState } from 'react';
import type { List, ListItem } from '../interfaces';
import { generateId, handleKeyDown, splitItemsToDoneAndUndoneLists } from '../utils/utils';
import { ChevronButton } from './atoms/ChevronButton';
import { useActiveCardIdStore, useStore } from '../stores/store';
import AddListItemButton from './atoms/AddListItemButton';
import ListOfItems from './ListOfItems';
import MenuButton from './atoms/MenuButton';

interface CardContentProps {
  editedItem?: List;
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardDataId: string;
  cardIndex: number
  cardId: string | null
}

const CardContent = ({ editedItem, cardRef, cardDataId, cardIndex, cardId }: CardContentProps) => {
  const { updateItem, addItem, removeCard } = useStore();
  const { editingCardId, resetStates } = useActiveCardIdStore()

  const defaultValues: List = useMemo(() => editedItem
    ? editedItem
    : {
      id: '',
      title: '',
      content: [{ id: generateId(), value: '', checked: false, depth: 0 } as ListItem],
    }, [editedItem]);

  const [openMenu, setOpenMenu] = useState<boolean>(false)

  const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(defaultValues.content);
  const [contentExpanded, setContentExpanded] = useState<boolean>(true);
  const doneTaskQuantity = checkedItems.length;

  const toggleExpand = (e: React.MouseEvent) => {
    e.preventDefault();
    setContentExpanded((expanded) => !expanded);
  };

  useEffect(() => {
    if (editingCardId === cardId) {
      const listItems = document.querySelectorAll(
        `[data-testid='${cardDataId}'] textarea`
      ) as NodeListOf<HTMLTextAreaElement>;

      const onKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          resetStates()
          const activeEl = document.activeElement
          if (activeEl instanceof HTMLElement) {
            activeEl.blur()
          }
        }
        if (!e || !(e.target as HTMLTextAreaElement).name) return;
        handleKeyDown(e, Array.from(listItems));
      };

      listItems?.forEach((item: HTMLTextAreaElement) => item.addEventListener('keydown', onKeyDown));
      return () => listItems?.forEach((item: HTMLTextAreaElement) => item.removeEventListener('keydown', onKeyDown));
    }
  }, [cardDataId, cardId, editedItem?.content, editingCardId, resetStates]);

  const handleSubmit = useCallback(() => {
    const data = { ...defaultValues } //TODO tere was getValue() from RHF
    data.content = data.content?.filter((el: ListItem) => el.value);
    if (data.title || data.content.length) {
      if (editedItem) {
        updateItem({ ...editedItem, ...data });
        // reset({ content: data.content, title: data.title });
      } else {
        addItem({ id: generateId(), title: data.title, content: data.content });
        // reset();
      }
    } else {
      if (editedItem) {
        removeCard(editedItem.id)
      }
      // reset();
    }
  }, [defaultValues, editedItem, updateItem, addItem, removeCard]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (editingCardId === cardId) {
        if (cardRef?.current && !cardRef.current.contains(e.target as Node)) {
          handleSubmit();
          resetStates();
        }
      };
      const dropdownCardEl = document.querySelector(`[data-id='card-${editedItem?.id}'] #dropdown`)
      if (dropdownCardEl && !dropdownCardEl.contains(e.target as Node)) {
        setOpenMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside);

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [cardRef, handleSubmit, setOpenMenu, editedItem?.id, resetStates, editingCardId, cardId]);

  const handleCreateNewLine = (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // let indexOfActiveEl: number;
    // const target = e.target instanceof HTMLTextAreaElement ? e.target.name : undefined;
    // if (e.nativeEvent instanceof KeyboardEvent && target) {
    //   indexOfActiveEl = parseInt(target.split('.')[1] ?? '-1');
    // } else {
    //   indexOfActiveEl = editedItem.content.length;
    // }
    // const newItem = { id: generateId(), value: '', checked: false } as ListItem;
    // insert(indexOfActiveEl + 1, newItem as ListItem, { focusName: `content.${indexOfActiveEl + 1}.value` });
  };

  const handleFormEvents = (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!e) return;
    if (editingCardId === cardId && cardRef.current) {
      const isETypeOfKeyboardEvent = e.nativeEvent instanceof KeyboardEvent && 'key' in e && e.key === 'Enter';
      if (isETypeOfKeyboardEvent && e.shiftKey) {
        e.preventDefault();
        handleSubmit();
        resetStates();
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
          {/* {editingCardId !== cardId && editedItem && (
            <h2 className="p-2 text-2xl wrap-break-word font-bold border-0 text-secondary">{editedItem.title}</h2>
          )}
          {editingCardId === cardId && ( */}
            <textarea
              className="p-2 text-2xl font-bold border-0 text-secondary resize-none overflow-hidden field-sizing-content"
              // {...register('title')}
              defaultValue={editedItem?.title}
              onBlur={(e) => console.log('target ', e.target.value)}
              placeholder="Tytuł..."
            />
          {/* )} */}
          {uncheckedItems.length > 0 && (
            <ListOfItems
              listId={editedItem?.id}
              list={uncheckedItems}
              checkedItems={false}
              cardIndex={cardIndex}
            // remove={remove}
            />
          )}
          {(editingCardId === cardId || editedItem) && <AddListItemButton handleCreateNewLine={handleCreateNewLine} />}
          {doneTaskQuantity > 0 && (
            <>
              <div className="border-t border-primary w-full" />
              <ChevronButton toggle={toggleExpand} contentExpanded={contentExpanded} quantity={doneTaskQuantity} />
              {contentExpanded && (
                <ListOfItems
                  listId={editedItem?.id}
                  list={checkedItems}
                  checkedItems={true}
                  cardIndex={cardIndex}
                />
              )}
            </>
          )}
        </div>
      </form>
      {editedItem && <MenuButton cardId={editedItem.id} openMenu={openMenu} setOpenMenu={setOpenMenu} fields={checkedItems} />}
    </>
  );
};

export default CardContent;
