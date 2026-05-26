import type { FieldArrayWithId, UseFormRegister } from "react-hook-form";
import ListElem from "./ListElem";
import type { List } from "../interfaces";
import React, { useEffect, useState } from "react";
import chevronUp from "../assets/chevron-up.png";
import chevronDown from "../assets/chevron-down.png";


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
  const uncheckedItems = []
  const checkedItems = []

  for (let i = 0; i < fields.length; i++) {
    if (fields[i].checked) {
      checkedItems.push({ ...fields[i], index: i })
    } else {
      uncheckedItems.push({ ...fields[i], index: i })
    }
  }

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e || !(e.target as HTMLTextAreaElement).name) return;
      const elName = (e.target as HTMLTextAreaElement).name
      const indexOfEl: number = parseInt(elName.split('.')[1])
      let focusedEl;
      if (e.key === "ArrowDown") {
        if (isNaN(indexOfEl)) {
          focusedEl = document.querySelector(`${item ? `[data-id='card-${item.id}'] [name='content.0.value']` : `[data-id='empty-card'] [name='content.0.value']`}`) as HTMLTextAreaElement
        } else {
          const indexOfNextEl = indexOfEl + 1
          focusedEl = document.querySelector(`${item ? `[data-id='card-${item.id}'] [name='content.${indexOfNextEl}.value']` : `[data-id='empty-card'] [name='content.${indexOfNextEl}.value']`}`) as HTMLTextAreaElement
        }
      } else if (e.key === "ArrowUp") {
        if (indexOfEl === 0) {
          focusedEl = document.querySelector(`${item ? `[data-id='card-${item.id}'] [name='title']` : `[data-id='empty-card'] [name='title']`}`) as HTMLTextAreaElement
        } else {
          const indexOfPrevEl = indexOfEl - 1
          focusedEl = document.querySelector(`${item ? `[data-id='card-${item.id}'] [name='content.${indexOfPrevEl}.value']` : `[data-id='empty-card'] [name='content.${indexOfPrevEl}.value']`}`) as HTMLTextAreaElement
        }
      }
      if (focusedEl) focusedEl.focus()
      //ustaw karete na koniec linijki jeśli jest text 
    }

    const listItems = document.querySelectorAll(item ? `[data-id='card-${item.id}'] textarea` : `[data-id='empty-card'] textarea`) as NodeListOf<HTMLTextAreaElement>
    listItems?.forEach((item: HTMLTextAreaElement) => item.addEventListener('keydown', handleKeyDown))
    return () => listItems?.forEach((item: HTMLTextAreaElement) => item.removeEventListener('keydown', handleKeyDown))
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
                  mode="form"
                  register={register}
                  listId={item?.id ?? ''}
                  handleCheck={item && handleCheck}
                  handleRemoveFieldItem={handleRemoveFieldItem}
                />
              ))}
            </ul>
          )}
          {cardEdit && <button onClick={handleNewLine} className="self-start text-black/75 hover:text-black">+ Element listy</button>}
          {checkedItems.length > 0 && (
            <>
              <div className="border-t border-mist-300 w-full" />
              <button onClick={(e) => { e.preventDefault(); setContentExpanded(!contentExpanded) }} className="flex flex-row items-center"><img src={contentExpanded ? chevronUp : chevronDown} alt={`${contentExpanded}? 'hide content':'expand content`} className="size-4" aria-expanded={`${contentExpanded? 'true': 'false'}`} />
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
                      mode="form"
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