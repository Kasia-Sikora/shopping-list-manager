import { useState } from "react";
import type { List } from "../interfaces";
import ListElem from "./ListElem";
import chevronUp from '../assets/chevron-up.png';
import chevronDown from '../assets/chevron-down.png'

const PreviewComponent = ({ item, cardEdit, handleCheck, handleRemoveFieldItem }: {
  item: List;
  cardEdit: boolean;
  handleCheck: (index: number, listId: string, checked: boolean) => void;
  handleRemoveFieldItem: (index: number) => void
}) => {
  const [contentExpanded, setContentExpanded] = useState<boolean>(true)
  const uncheckedItems = []
  const checkedItems = []

  for (let i = 0; i < item.content.length; i++) {
    if (item.content[i].checked) {
      checkedItems.push({ ...item.content[i], index: i })
    } else {
      uncheckedItems.push({ ...item.content[i], index: i })
    }
  }
  return (
    <>
      <h2 className="p-2 text-2xl font-bold border-0 text-secondary">{item.title}</h2>
      {uncheckedItems.length > 0 && (
        <ul className="w-full" data-testid={'uncheckedItems'}>
          {uncheckedItems.map((contentItem, index) => {
            return (
              <ListElem
                key={contentItem.listItemId}
                item={contentItem}
                index={index}
                cardEdit={cardEdit}
                mode="preview"
                listId={item.id}
                handleCheck={handleCheck}
                handleRemoveFieldItem={handleRemoveFieldItem}
              />
            );
          })}
        </ul>
      )}
      {checkedItems.length > 0 && (
        <>
          <div className="border-t border-mist-300 w-full" />
          <button onClick={(e) => { e.preventDefault(); setContentExpanded(!contentExpanded) }} className="flex flex-row items-center"><img src={contentExpanded ? chevronUp : chevronDown} alt={`${contentExpanded}? 'hide content':'expand content`} className="size-4" aria-expanded={`${contentExpanded ? 'true' : 'false'}`} />
            <h6 className="p-2 text-l border-0 text-gray-500">
              {checkedItems.length} ukończonych elementów
            </h6>
          </button>          
          {contentExpanded && <ul className="w-full" data-testid={'checkedItems'}>
            {checkedItems?.map((contentItem, index) => {
              return (
                <ListElem
                  key={contentItem.listItemId}
                  item={contentItem}
                  index={index}
                  cardEdit={cardEdit}
                  mode="preview"
                  listId={item.id}
                  handleCheck={handleCheck}
                  handleRemoveFieldItem={handleRemoveFieldItem}
                />
              )
            })}
          </ul>}
        </>
      )}
    </>
  )
}

export default PreviewComponent;