import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import ListElem from './ListElem';
import { useState } from 'react';
import type { FieldListItem, List } from '../interfaces';
import { isSortableOperation } from '@dnd-kit/react/sortable';
import { useFormArrayContext } from '../utils/useFormArray';
import { SnapModifier } from '@dnd-kit/abstract/modifiers';


type ListOfItem = {
  list: FieldListItem[];
  listId?: string;
  checkedItems: boolean;
  cardIndex: number
};

const ListOfItems = ({ list, listId, checkedItems }: ListOfItem) => {
  const { move } = useFormArrayContext<List, 'content'>()
  const listRef = useRef(null)
  const nestedRef = useRef(null)

  const { isDropTarget } = useDroppable({
    id: `card-${listId ?? 'empty'}`,
    element: listRef,
  });

  const [active, setActive] = useState<boolean>(false);

  const dataId = `card-${listId}-${checkedItems ? 'checkedItems' : 'uncheckedItems'}`;

  const snapToGrid = SnapModifier.configure({
    size: {
      x: Math.min(35, 0),
      y: 1
    }
  })

  useEffect(() => {
    if (listRef && listRef.current) {
      setListRefCurr(listRef.current)
    }
    if (nestedRef && nestedRef.current) {
      setNestedListRefCurr(nestedRef.current)
    }
  }, [listRef, nestedRef])

  return (
    <DragDropProvider
      modifiers={[snapToGrid
      ]}
      onDragEnd={(event) => {
        if (event.canceled) return;
        if (active) {
          setActive(false);
        }
        if (isDropTarget) {
          console.log('isDropped ', isDropTarget)
        }
        const { operation } = event
        if (isSortableOperation(operation)) {
          const { source, target } = operation
          if (source && target && listId) {
            const targetGlobalIndex = list[target.index].fieldArrayId;
            move(source.data.fieldArrayId, targetGlobalIndex)

            if (position.current.x && position.initial.x) {
            const difference = position.current.x - position.initial.x
            console.log({ difference })

            if (difference >= 35) {
              console.log(target.data.id)
              source.type = 'parent element'
          }
        }
        }
      }}}

      // onCollision={(event) => console.log('collision ', event)}
      onDragOver={() => {
        // if (event) {
        //   console.log('position over', event.operation.position)
        // }
        // setContent((content) => move(content, event));
        if (!active) {
          setActive(true);
        }
      }}
    >
      <ul
        ref={listRef}
        // style={containerStyle}
        className={`${active ? 'bg-active/50 outline-2 outline-dashed' : ''} transition-all duration-300 outline-active rounded-sm w-full relative `}
        data-testid={dataId}
      >
        {list.map((field, index) =>
          field.children ? (
            // <Fragment key={`${field.listItemId}-${index}`}>
            <ListElem
              key={field.listItemId}
              item={field}
              sortableIndex={index}
              fieldArrayId={field.fieldArrayId}
              listId={listId ?? ''}
              listRef={listRefCurr}
              children={(
                <ul ref={nestedRef} className={'ml-7.75 w-full'}>
                  {field.children.map((child, index) => (
                    <ListElem
                      key={child.listItemId}
                      item={child}
                      sortableIndex={index}
                      fieldArrayId={index}
                      listId={field.listItemId}
                      listRef={nestedListRefCurr}
                    />
                  ))}
                </ul>)}
            />
          ) : (
            <ListElem
              key={field.listItemId}
              item={field}
              sortableIndex={index}
              fieldArrayId={field.fieldArrayId}
              listId={listId ?? ''}
              listRef={listRefCurr}
            />
          ))
        }
      </ul>
    </DragDropProvider >
  );
};

export default ListOfItems;
