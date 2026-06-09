import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import ListElem from './ListElem';
import { useState, useRef, useEffect, Fragment } from 'react';
import type { FieldListItem } from '../interfaces';
import { isSortableOperation } from '@dnd-kit/react/sortable';
import { useStore } from '../stores/store';
import { SnapModifier } from '@dnd-kit/abstract/modifiers';
import { move } from '@dnd-kit/helpers';


type ListOfItem = {
  list: FieldListItem[];
  listId?: string;
  checkedItems: boolean;
  cardIndex: number
};

const ListOfItems = ({ list, listId, checkedItems, cardIndex }: ListOfItem) => {
  const { moveListItem, items, setContent } = useStore()
  const listRef = useRef(null)
  const nestedRef = useRef(null)
  const [listRefCurr, setListRefCurr] = useState(null)
  const [nestedListRefCurr, setNestedListRefCurr] = useState(null)

  const { isDropTarget } = useDroppable({
    id: `card-${listId ?? 'empty'}`,
    element: listRef,
  });

  const [viewedList, setViewedList] = useState(list)

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

  console.log({ viewedList })
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
          const { source, target, position } = operation
          if (position.current.x && position.initial.x) {
            const difference = position.current.x - position.initial.x
            console.log({ difference })

            if (difference >= 35) {
              console.log(target.data.id)
              source.type = 'parent element'
              // setViewedList((viewedList) => move(viewedList, event))

              // const copiedContent: ListItem[] = [...items[cardIndex].content]
              for (let i = 0; i < viewedList.length; i++) {
                if (viewedList[i].listItemId === target.data.id) {
                  console.log({ i })
                  console.log('before splice ', viewedList[i - 1])
                  console.log({ viewedList })

                  const removedItem = viewedList.splice(i, 1)
                  console.log('after splice ', viewedList[i - 1])
                  const currentChildren = viewedList[i - 1]?.children ?? []
                  console.log({currentChildren})
                  setViewedList((viewedList) => {
                    return viewedList.map((item, idx) => {
                      if (idx === i - 1) {
                        return ({ ...item, children: [...currentChildren, ...removedItem] })
                      }
                      return item
                    })
                  })
                  // updatedItems = true
                  break;
                }
                // console.log({ i })
                // refresh UI after update nesting
                // check content[i-1] after first nesting if it works fine

              }
              // if (updatedItems) {
              //   // setContent(listId, copiedContent)
              //   setViewedList(() => move(viewedList, event))
              // } 
              console.log({ viewedList })
            }






            // target.element.grt
            // console.log(target.element.)

          } else


            if (source && target && listId) {
              moveListItem(listId, source.data.fieldArrayId, target.index)
            }
        }
      }}

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
        {viewedList.map((field, index) =>
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
