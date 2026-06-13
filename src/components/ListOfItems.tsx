import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import ListElem from './ListElem';
import { useEffect, useState, useRef } from 'react';
import type { StoreListItem } from '../interfaces';
import { isSortableOperation } from '@dnd-kit/react/sortable';

type ListOfItem = {
  list: StoreListItem[];
  listId?: string;
  checkedItems: boolean;
  cardIndex: number;
};

const ListOfItems = ({ list, listId, checkedItems }: ListOfItem) => {
  const listRef = useRef<HTMLUListElement>(null)
  const [listRefCurr, setListRefCurr] = useState<HTMLElement | null>(null)

  const { isDropTarget } = useDroppable({
    id: `card-${listId ?? 'empty'}-${checkedItems ? 'checked' : 'unchecked'}`,
    element: listRef,
  });

  const dataId = `card-${listId}-${checkedItems ? 'checkedItems' : 'uncheckedItems'}`;

  useEffect(() => {
    if (listRef.current) {
      setListRefCurr(listRef.current)
    }
  }, [listRef])

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        const { operation } = event;
        if (isSortableOperation(operation)) {
          const { source, target, position } = operation;
          if (source && target && listId) {

            if (position.current.x && position.initial.x) {
              const difference = position.current.x - position.initial.x

              if (difference >= 35) {
                source.type = 'parent element'
              }
            }
          }
        }
      }}
    >
      <ul
        ref={listRef}
        className={`transition-all duration-300 outline-active rounded-sm relative ${isDropTarget ? 'bg-active/10' : ''}`}
        data-testid={dataId}
      >
        {list.map((field, index) => (
          <ListElem
            key={field.id}
            item={field}
            sortableIndex={index}
            globalArrayIndex={field.storeArrayIndex}
            listId={listId ?? ''}
            listRef={listRefCurr}
            depth={field.depth}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
};

export default ListOfItems;
