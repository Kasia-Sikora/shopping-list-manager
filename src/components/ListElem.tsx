import type { UseFormRegister } from 'react-hook-form';
import type { List, ListItem } from '../interfaces';
import { useStore } from '../store';

const ListElem = ({
  item,
  index,
  cardEdit,
  mode,
  register,
  listId = '',
  handleCheck,
  handleRemoveFieldItem
}: {
  item: ListItem;
  index: number;
  cardEdit: boolean;
  mode: 'preview' | 'form';
  register?: UseFormRegister<List>;
  listId?: string;
  handleCheck?: (index: number, listId: string, checked: boolean) => void;
  handleRemoveFieldItem: (index: number) => void
}) => {
  const { removeItem } = useStore()

  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault()
    removeItem(listId, item.listItemId)
    handleRemoveFieldItem(index)
  }

  return mode === 'form' && register ? (
    <li
      className={`${item.checked && 'line-through text-gray-500'} flex ${item.value ? 'items-baseline' : 'items-center'} gap-2`}
    >
      <input {...register(`content.${index}.listItemId` as const)} type="hidden" />
      {cardEdit && (
        <input
          type="checkbox"
          checked={item.checked}
          data-testid={item.listItemId? `list-item-${item.listItemId}-checkbox` : ''}
          onChange={(e) => {
            handleCheck?.(index, listId, e.target.checked);
          }}
          className="w-6 h-6 mr-2 shrink-0"
        />
      )}
      <textarea
        {...register(`content.${index}.value` as const)}
        className="p-2 border-0 grow text-wrap"
        placeholder="Utwórz listę..."
        data-testid={`card-${listId}-textarea`}
      />
      {item && <button type={'reset'} onClick={handleRemoveItem} className='shrink-0 justify-self-end rounded-full bg-amber-400 hover:bg-amber-300  hover:no-underline size-6 after:content-["\00d7"] after:text-black ' aria-label='Delete' />}
    </li>
  ) : mode === 'preview' ? (
    <li
      className={`${item.checked && 'line-through text-gray-500'} flex ${item.value ? 'items-baseline' : 'items-center'} gap-2`}
    >
      <input
        type="checkbox"
        data-testid={`list-item-${item.listItemId}-checkbox`}
        className="w-6 h-6 mr-2 shrink-0"
        checked={item.checked}
        onChange={(e) => {
          handleCheck?.(index, listId, e.target.checked);
        }}
        tabIndex={1}
      />
        <p className="p-2 min-h-10 w-full" data-testid={`card-${listId}-paragraph`}>{item.value}</p>
      {item && <button onClick={handleRemoveItem} className='shrink-0 justify-self-end rounded-full bg-amber-400 hover:bg-amber-300 size-6 after:content-["\00d7"]'/>}
    </li>
  ) : null;
};

export default ListElem;
