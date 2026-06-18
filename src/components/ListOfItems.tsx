import { DragDropProvider, DragOverlay, useDroppable } from '@dnd-kit/react';
import ListElem from './ListElem';
import { useEffect, useState, useRef } from 'react';
import { isSortableOperation } from '@dnd-kit/react/sortable';
import { PointerSensor, PointerActivationConstraints } from '@dnd-kit/dom';
import type { List, ListItem, SetLocalDataActions, } from '../interfaces';
import { EMPTY_CARD_ID, MAX_LIST_DEPTH } from '../consts';
import { getSubtreeCount } from '../utils/utils';
// import { getSubtreeCount } from '../utils/utils';


type ListOfItems = {
  list: ListItem[];
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
  const [activeItem, setActiveItem] = useState<{ id: string, globalIdx: number } | undefined>(undefined)
  const [subtreeCount, setSubtreeCount] = useState<number | undefined>(undefined)
  const [subtree, setSubtree] = useState<ListItem[]>([])

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
    setActiveItem(undefined);
    setSubtreeCount(undefined);
    setSubtree([]);
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
            const newContent = [...editedList.content];
            const fromIndex = newContent.findIndex(item => item.id === source.id);

            if (fromIndex !== -1) {
              const count = getSubtreeCount(newContent, fromIndex);
              const subtreeToMove = newContent.splice(fromIndex, count + 1);

              if (position.current.x !== undefined && position.initial.x !== undefined) {
                const difference = position.current.x - position.initial.x;
                if (Math.abs(difference) >= 35) {
                  const depthChange = difference > 0 ? 1 : -1;
                  const oldDepth = subtreeToMove[0].depth;
                  const newDepth = Math.max(0, Math.min(MAX_LIST_DEPTH, oldDepth + depthChange));
                  const actualChange = newDepth - oldDepth;
                  
                  subtreeToMove.forEach(item => {
                    item.depth = Math.max(0, Math.min(MAX_LIST_DEPTH, item.depth + actualChange));
                  });
                }
              }

              let toIndex = newContent.findIndex(item => item.id === target.id);
              if (toIndex !== -1) {
                if (source.index > source.initialIndex) {
                  const targetSubtreeCount = getSubtreeCount(newContent, toIndex);
                  toIndex += targetSubtreeCount + 1;
                }
                newContent.splice(toIndex, 0, ...subtreeToMove);
              } else {
                newContent.splice(fromIndex, 0, ...subtreeToMove);
              }

              actions.update({ content: newContent });
            }
          }
        }
        resetDragState()
      }}
      onDragStart={(e) => {
        if (!active) {
          setActive(true);
        }

        const draggingId = e.operation.source.id;
        const globalIdx = editedList.content.findIndex(f => f.id === draggingId);
        if (globalIdx !== -1) {
          const count = getSubtreeCount(editedList.content, globalIdx);
          setActiveItem({
            id: draggingId,
            globalIdx: globalIdx
          });
          setSubtreeCount(count);
          setSubtree(editedList.content.slice(globalIdx, globalIdx + count + 1));
        }
      }}
    >
      <ul
        ref={listRef}
        className={`transition-all duration-300 outline-active rounded-sm relative outline-dashed outline-2 ${active ? 'bg-active/30  outline-active/70 ' : 'outline-transparent'}`}
        data-testid={dataId}
      >
        {list.map((field, index) => {
          const isChildOfDragging = activeItem &&
            index > activeItem.globalIdx &&
            index <= activeItem.globalIdx + (subtreeCount ?? 0);
          
          return (
            <ListElem
              key={field.id}
              item={field}
              sortableIndex={index}
              listId={listId ?? ''}
              listRef={listRefCurr}
              depth={field.depth}
              isHidden={!!isChildOfDragging}
              actions={actions}
              list={editedList.content}
            />
          )
        })}
        <DragOverlay>
          <div className="opacity-80 pointer-events-none">
            {subtree.map(item => (
              <ListElem
                key={`overlay-${item.id}`}
                item={item}
                sortableIndex={null}
                listId={listId ?? ''}
                listRef={listRefCurr}
                depth={item.depth}
                actions={actions}
                list={editedList.content}
                isOverlay={true}
              />
            ))}
          </div>
        </DragOverlay>
      </ul>
    </DragDropProvider>
  );
};

export default ListOfItems;
