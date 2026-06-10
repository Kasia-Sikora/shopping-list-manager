import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import ListElem from './ListElem';
import { useState } from 'react';
import type { FieldListItem, List } from '../interfaces';
import { isSortableOperation } from '@dnd-kit/react/sortable';
import { useFormArrayContext } from '../utils/useFormArray';

type ListOfItem = {
  list: FieldListItem[];
  listId?: string;
  checkedItems: boolean;
};

const ListOfItems = ({ list, listId, checkedItems }: ListOfItem) => {
  const { move } = useFormArrayContext<List, 'content'>()
  const { ref } = useDroppable({
    id: `card-${listId ?? 'empty'}`,
  });
  const [active, setActive] = useState<boolean>(false);

  const dataId = `card-${listId}-${checkedItems ? 'checkedItems' : 'uncheckedItems'}`;
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        if (active) {
          setActive(false);
        }
        const { operation } = event
        if (isSortableOperation(operation)) {
          const { source, target } = operation
          if (source && target && listId) {
            const targetGlobalIndex = list[target.index].fieldArrayId;
            move(source.data.fieldArrayId, targetGlobalIndex)
          }
        }
      }}
      onDragOver={() => {
        if (!active) {
          setActive(true);
        }
      }}
    >
      <ul
        ref={ref}
        className={`${active ? 'bg-active/50 outline-2 outline-dashed' : ''} transition-all duration-300 outline-active rounded-sm w-full`}
        data-testid={dataId}
      >
        {list.map((field, index) => (
          <ListElem
            key={field.listItemId}
            item={field}
            sortableIndex={index}
            fieldArrayId={field.fieldArrayId}
            listId={listId ?? ''}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
};

export default ListOfItems;
