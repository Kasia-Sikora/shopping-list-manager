import type { UseFormRegister } from 'react-hook-form';
import type { List, ListItem } from '../interfaces';
import { useStore } from '../store';

const ListElement = ({
  item,
  index,
  cardEdit,
  register,
  listId = '',
  handleCheck,
  handleRemoveFieldItem
}: {
  item: ListItem;
  index: number;
  cardEdit: boolean;
  register?: UseFormRegister<List>;
  listId?: string;
  handleCheck?: (index: number, listId: string, checked: boolean) => void;
  handleRemoveFieldItem: (index: number) => void
}) => {
  const formMode = cardEdit && !!register
  const { removeItem } = useStore()

  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault()
    removeItem(listId, item.listItemId)
    handleRemoveFieldItem(index)
  }

  return (
    <li
      className={`${item.checked && 'line-through text-gray-500'} flex ${item.value ? 'items-baseline' : 'items-center'} gap-2`}
    >
      {formMode && <input {...register(`content.${index}.listItemId` as const)} type="hidden" />}
      <input
        type="checkbox"
        checked={item.checked}
        data-testid={item.listItemId ? `list-item-${item.listItemId}-checkbox` : ''}
        onChange={(e) => {
          handleCheck?.(index, listId, e.target.checked);
        }}
        className="w-6 h-6 mr-2 shrink-0"
      />
      {(formMode || register) ? (
        <textarea
          {...register(`content.${index}.value` as const)}
          className="p-2 border-0 grow text-wrap"
          placeholder="Utwórz listę..."
          data-testid={`card-${listId}-textarea`}
        />
      ) : (
        <p className="p-2 min-h-10 w-full color-placeholder" data-testid={`card-${listId ? listId : 'empty'}-paragraph`}>{item.value ? item.value : 'Utwórz listę...'}</p>
      )}
      {item && (
        <button onClick={handleRemoveItem} className='shrink-0 justify-self-end rounded-full bg-amber-400 hover:bg-amber-300  hover:no-underline size-6 after:content-["\00d7"] after:text-black ' aria-label='Delete' />
      )}
    </li>
  )
};

export default ListElement;
