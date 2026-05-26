import type { FieldArrayWithId, UseFormRegister } from "react-hook-form";
import ListElem from "./ListElem";
import type { List } from "../interfaces";
import React, { useEffect, useState } from "react";
import chevronUp from "../assets/chevron-up.png";
import chevronDown from "../assets/chevron-down.png";
import { handleKeyDown, splitItemsToDoneAndUndoneLists } from "./utils";


const FormComponent = ({
  fields,
  item,
  cardEdit,
  register,
  handleNewLine,
  handleCheck,
  handleRemoveFieldItem
}: {
  fields: FieldArrayWithId<List, "content", "id">[],
  item?: List;
  cardEdit: boolean;
  register: UseFormRegister<List>;
  handleNewLine: (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLFormElement>) => void,
  handleCheck?: (index: number, listId: string, checked: boolean) => void;
  handleRemoveFieldItem: (index: number) => void
}) => {

  const [contentExpanded, setContentExpanded] = useState<boolean>(true)
  const { uncheckedItems, checkedItems } = splitItemsToDoneAndUndoneLists(fields)

  useEffect(() => {
    const cardId = item ? `card-${item.id}` : 'empty-card';

    const onKeyDown = (e: KeyboardEvent) => {
      if (!e || !(e.target as HTMLTextAreaElement).name) return;
      handleKeyDown(e, cardId)
    }

    const listItems = document.querySelectorAll(`[data-id='card-${cardId}'] textarea`) as NodeListOf<HTMLTextAreaElement>
    listItems?.forEach((item: HTMLTextAreaElement) => item.addEventListener('keydown', onKeyDown))
    return () => listItems?.forEach((item: HTMLTextAreaElement) => item.removeEventListener('keydown', onKeyDown))
  }, [fields, item])

  return (
    <form onKeyDown={(e) => handleNewLine(e)}>
      <div className="flex flex-col align-baseline gap-2">
        {cardEdit && (
          <textarea className="p-2 text-2xl font-bold border-0 text-secondary" {...register('title')} placeholder="Tytuł..." />
        )}
        <div className="flex flex-col align-baseline gap-2">
          {uncheckedItems.length > 0 && (
            <ul className="w-full" data-testid={'uncheckedItems'}>
              {uncheckedItems.map((field) => (
                <ListElem
                  key={field.listItemId}
                  item={field}
                  index={field.index}
                  cardEdit={cardEdit} 
                  register={register}
                  listId={item?.id ?? ''}
                  handleCheck={item && handleCheck}
                  handleRemoveFieldItem={handleRemoveFieldItem}
                />
              ))}
            </ul>
          )}
          {(cardEdit || item) && <button onClick={handleNewLine} className="self-start text-accent hover:text-secondary">+ Element listy</button>}
          {checkedItems.length > 0 && (
            <>
              <div className="border-t border-mist-300 w-full" />
              <button onClick={(e) => { e.preventDefault(); setContentExpanded(!contentExpanded) }} className="flex flex-row items-center"><img src={contentExpanded ? chevronUp : chevronDown} alt={`${contentExpanded}? 'hide content':'expand content`} className="size-4" aria-expanded={`${contentExpanded ? 'true' : 'false'}`} />
                <h6 className="p-2 text-l border-0 text-gray-500">
                  {fields.filter((elem) => elem.checked).length} ukończonych elementów
                </h6>
              </button>
              {contentExpanded &&
                <ul className="w-full" data-testid={'checkedItems'}>
                  {checkedItems.map((field) => (
                    <ListElem
                      key={field.listItemId}
                      item={field}
                      index={field.index}
                      cardEdit={cardEdit}
                      register={register}
                      listId={item?.id ?? ''}
                      handleCheck={item && handleCheck}
                      handleRemoveFieldItem={handleRemoveFieldItem}
                    />
                  ))}
                </ul>
              }
            </>
          )}
        </div>
      </div>
    </form>
  )
}

export default FormComponent;