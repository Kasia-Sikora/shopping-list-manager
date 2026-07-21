import { move } from '@dnd-kit/helpers';
import { DragDropProvider, DragOverlay, useDroppable } from '@dnd-kit/react';
import { useEffect, useRef, useState } from 'react';
import { EMPTY_CARD_ID, INDENT_VALUE } from '../consts';
import type { List, ListItem, SetLocalDataActions } from '../interfaces';
import { buildTree, getDescendants, getDragDepth, getProjection } from '../utils/treeUtils';
import ListElem from './ListElem';
import { useTreeValidation } from '../hooks/useTreeValidation';

type ListOfItems = {
  list: ListItem[];
  listId?: string;
  checkedItems: boolean;
  actions: SetLocalDataActions;
  editedList: List
  cardDataId: string
};

const ListOfItems = ({ editedList, list, listId, checkedItems, actions, cardDataId }: ListOfItems) => {
  const listRef = useRef<HTMLUListElement>(null)
  const [listRefCurr, setListRefCurr] = useState<HTMLElement | null>(null)
  const [active, setActive] = useState<boolean>(false)
  const isListWithChecked = list[0].checked
  const [activeItemId, setActiveItemId] = useState<string | undefined>(undefined)

  const [tree, setTree] = useState(list)
  const isDragging = useRef(false);

  const dataId = `card-${listId}-${checkedItems ? 'checkedItems' : 'uncheckedItems'}`;

  useEffect(() => {
    if (list && !isDragging.current) {
      setTree(list);
    }
  }, [list]);

  useTreeValidation(tree, (validatedTree) => {
    setTree(validatedTree);
  });


  useDroppable({
    id: `card-${listId ?? EMPTY_CARD_ID}-${checkedItems ? 'checked' : 'unchecked'}`,
    element: listRef,
  });


  useEffect(() => {
    if (listRef.current) {
      setListRefCurr(listRef.current)
    }
  }, [listRef])

  const resetDragState = () => {
    setActive(false);
    setActiveItemId(undefined)
    setTree(list);
    sourceChildren.current = [];
    isDragging.current = false;
  };

  const initialDepth = useRef(0);
  const sourceChildren = useRef<ListItem[]>([]);

  return (
    <DragDropProvider
      onDragStart={(event) => {
        if (!active) {
          setActive(true);
        }

        const { source } = event.operation

        if (!source) return;
        isDragging.current = true;
        setTree(list)
        setActiveItemId(source.id as string)
        const { depth } = tree.find(({ id }) => id === source.id)!;

        // Store the source item's initial depth for later use
        initialDepth.current = depth;

        setTree((flattenedItems) => {
          sourceChildren.current = [];

          // Get all descendants of the source item
          const descendants = getDescendants(flattenedItems, source.id as string);

          return flattenedItems.filter((item) => {
            if (descendants.has(item.id)) {
              sourceChildren.current = [...sourceChildren.current, item];
              return false;
            }

            return true;
          });
        });

        initialDepth.current = depth;
      }}

      onDragOver={(event, manager) => {
        const { source, target } = event.operation;

        event.preventDefault();

        if (source && target && source.id !== target.id) {
          setTree((flattenedItems) => {
            const { position } = manager.dragOperation;
            const offsetLeft = position.current.x - position.initial.x;
            const dragDepth = getDragDepth(offsetLeft, INDENT_VALUE);
            const projectedDepth = initialDepth.current + dragDepth;

            const { depth, parentId } = getProjection(
              flattenedItems,
              target.id as string,
              projectedDepth
            );

            const sortedItems = move(flattenedItems, event);
            const newItems = sortedItems.map((item) =>
              item.id === source.id ? { ...item, depth, parentId } : item
            );

            return newItems;
          });
        }
      }}
      onDragMove={(event, manager) => {
        if (event.defaultPrevented) {
          return;
        }

        const { source, target } = event.operation;

        if (source && target) {
          const keyboard = event.operation.activatorEvent instanceof KeyboardEvent;
          const currentDepth = source.data!.depth ?? 0;
          let keyboardDepth;

          if (keyboard) {
            const isHorizontal = event.by?.x !== 0 && event.by?.y === 0;

            if (isHorizontal) {
              event.preventDefault();

              keyboardDepth = currentDepth + Math.sign(event.by!.x);
            }
          }

          const { position } = manager.dragOperation;
          const offsetLeft = position.current.x - position.initial.x;
          const dragDepth = getDragDepth(offsetLeft, INDENT_VALUE);

          const projectedDepth =
            keyboardDepth ?? initialDepth.current + dragDepth;
          const { depth, parentId } = getProjection(
            tree,
            source.id as string,
            projectedDepth
          );

          if (keyboard) {
            if (currentDepth !== depth) {
              const offset = INDENT_VALUE * (depth - currentDepth);

              manager.actions.move({
                by: { x: offset, y: 0 },
                propagate: false,
              });
            }
          }

          if (
            source.data!.depth !== depth ||
            source.data!.parentId !== parentId
          ) {
            setTree((flattenedItems) => {
              return flattenedItems.map((item) =>
                item.id === source.id ? { ...item, depth, parentId } : item
              );
            });
          }
        }
      }}

      onDragEnd={(event) => {
        if (event.canceled) {
          resetDragState()
          return
        };

        isDragging.current = false;


        const updatedTree = buildTree(
          tree,
          sourceChildren.current,
        );

        actions.update({ content: [...editedList.content.filter(item => item.checked === !isListWithChecked), ...updatedTree] });

        if (active) {
          setActive(false)
        }
      }}
    >
      <ul
        ref={listRef}
        className={`transition-all duration-300 outline-active rounded-sm relative outline-dashed outline-2 ${active ? 'bg-active/10  outline-active/50 ' : 'outline-transparent'}`}
        data-testid={dataId}
      >
        {tree.map((field, index) =>
          <ListElem
            key={`${field.id}-${cardDataId}`}
            item={field}
            sortableIndex={index}
            listId={listId ?? ''}
            listRef={listRefCurr}
            depth={field.depth}
            actions={actions}
            list={editedList.content}
            isActive={field.id === activeItemId}
          />

        )}
      </ul>
      {cardDataId !== `card-${EMPTY_CARD_ID}` ?
        <DragOverlay style={{ width: 'min-content', position: 'absolute', transition: 'transformY(50px)' }}>
          {/* @dnd-kit's Draggable type doesn't expose index at compile time, though it exists at runtime */}
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any*/}
          {(source: any) => (
            <ListElem
              key={source.id}
              item={source.data.item}
              sortableIndex={source.index}
              listId={listId ?? ''}
              listRef={listRefCurr}
              depth={source.data.depth}
              actions={actions}
              list={editedList.content}
              isOverlay={true}
            />
          )}
        </DragOverlay>
        : null}
    </DragDropProvider >
  );
};

export default ListOfItems;
