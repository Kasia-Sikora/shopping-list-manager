import type { List, ListItem } from '../interfaces';
import { useSortable } from '@dnd-kit/react/sortable';
import DeleteButton from './atoms/DeleteButton';
import { useFieldArrayFormContext } from '../AllFormMethodsProvider';

type ListElement = {
  item: ListItem;
  fieldArrayId: number;
  sortableIndex: number;
  listId?: string;
};

const ListElement = ({ item, fieldArrayId, sortableIndex, listId = '' }: ListElement) => {
  const { ref } = useSortable({
    id: `card-${listId}-item-${item.listItemId}`,
    index: sortableIndex,
    data: { fieldArrayId },
    disabled: !listId
  });

  const { register, update, getValues, remove } = useFieldArrayFormContext<List, 'content'>()

  const handleCheck = (index: number, checked: boolean) => {
    const { listItemId, value } = getValues(`content.${index}`);
    update(index, { listItemId, checked: checked, value });
  };

  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    remove(fieldArrayId);
  };

  return (
    <>
      {/* TODO remove custom className */}
      <li ref={ref} className={`listItem relative flex ${item.value ? 'items-baseline' : 'items-center'} gap-2 p-2`}>
        {listId && <div className='cursor-move size-5 rounded-sm bg-primary/20 shrink-0 text-primary after:relative after:flex after:justify-center after:-top-1.5 after:content-["⣶"]' />}
        <input {...register(`content.${fieldArrayId}.listItemId` as const)} type="hidden" />
        <input
          type="checkbox"
          checked={item.checked}
          disabled={!item}
          data-testid={item.listItemId ? `list-item-${item.listItemId}-checkbox` : ''}
          onChange={(e) => {
            handleCheck(fieldArrayId, e.target.checked);
          }}
          className="w-5 h-5 shrink-0 rounded-sm"
        />
        <textarea
          {...register(`content.${fieldArrayId}.value` as const)}
          className={`${item.checked && 'line-through text-gray-500'} border-0 grow text-wrap`}
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
