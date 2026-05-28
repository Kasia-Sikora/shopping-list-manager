import type { UseFormRegister } from 'react-hook-form';
import type { List, ListItem } from '../interfaces';
import { useStore } from '../stores/store';
import type { FC } from 'react';

type ListElement = {
  item: ListItem;
  index: number;
  register: UseFormRegister<List>;
  listId?: string;
  handleCheck?: (index: number, listId: string, checked: boolean) => void;
  remove: (index: number) => void;
};

const ListElement: FC<ListElement> = ({ item, index, register, listId = '', handleCheck, remove }) => {
  const { removeItem } = useStore();

  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    removeItem(listId, item.listItemId);
    remove(index);
  };

  return (
    <li className={`flex ${item.value ? 'items-baseline' : 'items-center'} gap-2`}>
      <input {...register(`content.${index}.listItemId` as const)} type="hidden" />
      <input
        type="checkbox"
        checked={item.checked}
        data-testid={item.listItemId ? `list-item-${item.listItemId}-checkbox` : ''}
        onChange={(e) => {
          handleCheck?.(index, listId, e.target.checked);
        }}
        className="w-6 h-6 mr-2 shrink-0"
      />
      <textarea
        {...register(`content.${index}.value` as const)}
        className={`${item.checked && 'line-through text-gray-500'} p-2 border-0 grow text-wrap`}
        placeholder="Utwórz listę..."
        data-testid={listId ? `card-${listId}-textarea` : 'card-empty-textarea'}
      />
      {item && (
        <button
          onClick={handleRemoveItem}
          className='shrink-0 justify-self-end rounded-full bg-accent focus:bg-accent/50 focus:hover:bg-accent/50 size-6 after:content-["\00d7"] after:text-mist-900'
          aria-label="Delete"
        />
      )}
    </li>
  );
};

export default ListElement;
