import type { UseFormRegister } from 'react-hook-form';
import type { List, ListItem } from '../interfaces';
import { useStore } from '../stores/store';
import DropIndicator from './atoms/DropIndicator';
import { useSortable } from '@dnd-kit/react/sortable';
import DeleteButton from './atoms/DeleteButton';

type ListElement = {
  item: ListItem;
  fieldArrayId: number;
  sortableIndex: number;
  register: UseFormRegister<List>;
  listId?: string;
  handleCheck?: (index: number, listId: string, checked: boolean) => void;
  remove: (index: number) => void;
};

const ListElement = ({ item, fieldArrayId, sortableIndex, register, listId = '', handleCheck, remove }: ListElement) => {
  const { removeItem } = useStore();
  const { ref } = useSortable({ id: `card-${listId}-item-${item.listItemId}`, index: sortableIndex });

  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    removeItem(listId, item.listItemId);
    remove(fieldArrayId);
  };

  return (
    <>
      <DropIndicator beforeId={fieldArrayId} />
      <li ref={ref} draggable={true} className={`flex ${item.value ? 'items-baseline' : 'items-center'} gap-2`}>
        {/* drag button */}
        <div className='size-5 rounded-sm bg-primary/20 flex justify-center items-center text-primary after:text-s after:content-["⇅"]' />
        <input {...register(`content.${fieldArrayId}.listItemId` as const)} type="hidden" />
        <input
          type="checkbox"
          checked={item.checked}
          data-testid={item.listItemId ? `list-item-${item.listItemId}-checkbox` : ''}
          onChange={(e) => {
            handleCheck?.(fieldArrayId, listId, e.target.checked);
          }}
          className="w-6 h-6 mr-2 shrink-0"
        />
        <textarea
          {...register(`content.${fieldArrayId}.value` as const)}
          className={`${item.checked && 'line-through text-gray-500'} p-2 border-0 grow text-wrap`}
          placeholder="Utwórz listę..."
          data-testid={listId ? `card-${listId}-textarea` : 'card-empty-textarea'}
        />
        {item && (
          <DeleteButton handleRemoveItem={handleRemoveItem} />
        )}
      </li>
    </>
  );
};

export default ListElement;
