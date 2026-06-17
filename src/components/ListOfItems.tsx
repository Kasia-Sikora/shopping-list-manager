import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import ListElem from './ListElem';
import { useEffect, useState, useRef } from 'react';
import { isSortableOperation } from '@dnd-kit/react/sortable';
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom';
import type { List, SetLocalDataActions, StoreListItem } from '../interfaces';
import { EMPTY_CARD_ID } from '../consts';
// import { getSubtreeCount } from '../utils/utils';


type ListOfItems = {
  list: StoreListItem[];
  listId?: string;
  checkedItems: boolean;
  cardIndex: number;
  actions: SetLocalDataActions;
  editedList: List
};

const ListOfItems = ({ editedList, list, listId, checkedItems, actions }: ListOfItems) => {
  const listRef = useRef<HTMLUListElement>(null)
  const [listRefCurr, setListRefCurr] = useState<HTMLElement | null>(null)
  const [active, setActive] = useState<boolean>(false)
  // const [activeItem, setActiveItem] = useState(undefined)
  // const [subtreeCount, setSubtreeCount] = useState(undefined)

  useDroppable({
    id: `card-${listId ?? EMPTY_CARD_ID}-${checkedItems ? 'checked' : 'unchecked'}`,
    element: listRef,
  });

  const dataId = `card-${listId}-${checkedItems ? 'checkedItems' : 'uncheckedItems'}`;

  useEffect(() => {
    if (listRef.current) {
      setListRefCurr(listRef.current)
    }
  }, [listRef])

  const resetDragState = () => {
    setActive(false);
    // setActiveItem(undefined);
    // setSubtreeCount(undefined);
  };

  return (
    <DragDropProvider
      sensors={(defaults) => [
        ...defaults.filter((sensor) => sensor !== PointerSensor),
        PointerSensor.configure({
          activationConstraints: [
            new PointerActivationConstraints.Distance({ value: 2 })
          ],
        }),
      ]}
      onDragEnd={(event) => {
        if (event.canceled) {
          resetDragState()
          return
        };
        const { operation } = event;
        if (isSortableOperation(operation)) {
          const { source, target, position } = operation;
          if (source && target && listId) {
            if (position.current.x && position.initial.x) {
              const difference = position.current.x - position.initial.x
              // const globalIndex = source.data.globalArrayIndex
              // const itemToUpdate = fields[source.data.globalArrayIndex]
              if (Math.abs(difference) >= 35 && source.index) {
                // const newDepth = difference > 0 ? Math.min(itemToUpdate.depth + 1, MAX_LIST_DEPTH) : Math.max(itemToUpdate.depth - 1, 0)
                // const { listItemId, value, checked } = itemToUpdate
                // setValue(`content.${globalIndex}`, { listItemId, value, checked, depth: newDepth })
              }
            }
            // const from = fields.findIndex(field => field.id === list[source.initialIndex].id);
            // const to = fields.findIndex(field => field.id === list[source.index].id);
            // if (from !== to) {
            //   const numToMove = (subtreeCount || 0) + 1;

            //   if (from < to) {
            //     for (let i = 0; i < numToMove; i++) {
            //       move(from , to);
            //     }
            //   } else {
            //     for (let i = 0; i < numToMove; i++) {
            //       move(from + i, to + i);
            //     }
            //   }
            // }
          }
        }
        if (active) {
          setActive(false)
        }
        resetDragState()
      }}
      onDragStart={() => {
        if (!active) {
          setActive(true);
        }

        // const draggingId = e.operation.source.data.id;
        // const globalIdx = fields.findIndex(f => f.listItemId === draggingId);
        // if (globalIdx !== -1) {
        //   const count = getSubtreeCount(fields, globalIdx);
        //   setActiveItem({
        //     listItemId: draggingId,
        //     globalArrayIndex: globalIdx
        //   });
        //   setSubtreeCount(count);
        // }
      }}
    >
      <ul
        ref={listRef}
        className={`transition-all duration-300 outline-active rounded-sm relative outline-dashed outline-2 ${active ? 'bg-active/30  outline-active/70 ' : 'outline-transparent'}`}
        data-testid={dataId}
      >
        {list.map((field, index) => {
          // const isChildOfDragging = activeItem &&
          //   field.globalArrayIndex > activeItem.globalArrayIndex &&
          //   field.globalArrayIndex <= activeItem.globalArrayIndex + subtreeCount;
          const isChildOfDragging = false
          return (
            <ListElem
              key={field.id}
              item={field}
              sortableIndex={index}
              globalArrayIndex={field.storeArrayIndex}
              listId={listId ?? ''}
              listRef={listRefCurr}
              depth={field.depth}
              isHidden={!!isChildOfDragging}
              actions={actions}
              list={editedList.content}
            />
          )
        })}
      </ul>
    </DragDropProvider>
  );
};

export default ListOfItems;
