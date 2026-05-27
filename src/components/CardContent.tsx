import { useEffect, useMemo, useState, type FC } from 'react';
import type { FieldListItem, List } from '../interfaces';
import { handleKeyDown } from './utils';
import { dataService } from '../DataService';
import ListElem from './ListElem';
import chevronUp from "../assets/chevron-up.png";
import chevronDown from "../assets/chevron-down.png";

interface CardContentProps {
  cardEdit: boolean;
  setEditCard: (edit: boolean) => void;
  editedItem?: List;
  cardRef: React.RefObject<HTMLDivElement | null>;
  cardDataId: string
}

const CardContent: FC<CardContentProps> = ({ cardEdit, setEditCard, editedItem, cardRef, cardDataId }) => {
  const { devidedItems, register, handleSubmit, handleCreateNewLine, remove, handleCheck } = dataService(editedItem)
  const [contentExpanded, setContentExpanded] = useState<boolean>(true)

  useEffect(() => {
    if (cardEdit) {
      const onKeyDown = (e: KeyboardEvent) => {
        if (!e || !(e.target as HTMLTextAreaElement).name) return;
        handleKeyDown(e, cardDataId)
      }

      const listItems = document.querySelectorAll(`[data-testid='${cardDataId}'] textarea`) as NodeListOf<HTMLTextAreaElement>
      listItems?.forEach((item: HTMLTextAreaElement) => item.addEventListener('keydown', onKeyDown))
      return () => listItems?.forEach((item: HTMLTextAreaElement) => item.removeEventListener('keydown', onKeyDown))
    }
  }, [cardDataId, cardEdit, devidedItems])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef?.current && !cardRef.current.contains(e.target as Node)) {
        handleSubmit();
        setEditCard(false);
      }
    };

    if (cardEdit) document.addEventListener('mousedown', handleClickOutside)

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [cardRef, setEditCard, cardEdit]);

  //TODO
  const handleFormEvents = useMemo(() => (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => {
    if (!e) return
    const isETypeOfKeyboardEvent = e.nativeEvent instanceof KeyboardEvent && 'key' in e && e.key === 'Enter'
    if (isETypeOfKeyboardEvent && e.shiftKey) {
      e.preventDefault();
      handleSubmit()
      setEditCard(false)
    } else if (isETypeOfKeyboardEvent || e.nativeEvent instanceof PointerEvent) {
      e.preventDefault();
      handleCreateNewLine(e)
    }
  }, [cardRef, setEditCard, cardEdit]);

  const mapListItems = (list: FieldListItem[], checkedItems: boolean) => {
    const dataId = checkedItems ? 'checkedItems' : 'uncheckedItems'
    return (
      <ul className="w-full" data-testid={dataId}>
        {list.map((field) => (
          <ListElem
            key={field.listItemId}
            item={field}
            index={field.index}
            listId={editedItem?.id ?? ''}
            register={register}
            handleCheck={editedItem && handleCheck}
            remove={remove}
          />
        ))}
      </ul>
    )
  }


  return (
    <form onKeyDown={handleFormEvents}>
      <div className="flex flex-col align-baseline gap-2">
        {(!cardEdit && editedItem) && (
          <h2 className="p-2 text-2xl font-bold border-0 text-secondary">{editedItem.title}</h2>)}
        {cardEdit && (
          <textarea className="p-2 text-2xl font-bold border-0 text-secondary" {...register('title')} placeholder="Tytuł..." />
        )}
        {devidedItems.uncheckedItems.length > 0 &&
          mapListItems(devidedItems.uncheckedItems, false)
        }
        {(cardEdit || editedItem) && <button onClick={handleCreateNewLine} className="self-start text-accent hover:text-secondary">+ Element listy</button>}
        {devidedItems.checkedItems.length > 0 && (
          <>
            <div className="border-t border-mist-300 w-full" />
            <button onClick={(e) => { e.preventDefault(); setContentExpanded(!contentExpanded) }} className="flex flex-row items-center"><img src={contentExpanded ? chevronUp : chevronDown} alt={`${contentExpanded}? 'hide content':'expand content`} className="size-4" aria-expanded={`${contentExpanded ? 'true' : 'false'}`} />
              <h6 className="p-2 text-l border-0 text-gray-500">
                {devidedItems.checkedItems.length} ukończonych elementów
              </h6>
            </button>
            {contentExpanded &&
              mapListItems(devidedItems.checkedItems, true)
            }
          </>
        )}
      </div>
    </form>
  )
}


export default CardContent;
