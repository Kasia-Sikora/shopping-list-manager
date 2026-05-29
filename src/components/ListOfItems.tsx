import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import ListElem from './ListElem';
import { useState } from 'react';
import type { FieldListItem, List } from '../interfaces';
import type { UseFieldArrayRemove, UseFormRegister } from 'react-hook-form';

type ListOfItem = {
  list: FieldListItem[];
  listId?: string;
  checkedItems: boolean;
  register: UseFormRegister<List>;
  remove: UseFieldArrayRemove;
  handleCheck?: (index: number, listId: string, checked: boolean) => void;
};

const ListOfItems = ({ list, listId, checkedItems, register, remove, handleCheck }: ListOfItem) => {
  const { ref } = useDroppable({
    id: `card-${listId ?? 'empty'}`,
  });
  const [active, setActive] = useState<boolean>(false);

  const dataId = `card-${listId}-${checkedItems ? 'checkedItems' : 'uncheckedItems'}}`;
  return (
    <DragDropProvider
      onDragEnd={(event) => {
        if (event.canceled) return;
        if (active) {
          setActive(false);
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
        className={`${active ? 'bg-secondary/50' : ''} transition-all duration-300 rounded-sm w-full`}
        data-testid={dataId}
      >
        {list.map((field, index) => (
          <ListElem
            key={field.listItemId}
            item={field}
            sortableIndex={index}
            fieldArrayId={field.fieldArrayId}
            listId={listId ?? ''}
            register={register}
            handleCheck={handleCheck}
            remove={remove}
          />
        ))}
      </ul>
    </DragDropProvider>
  );
};

export default ListOfItems;
