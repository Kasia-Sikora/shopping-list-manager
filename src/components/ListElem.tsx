import type { List, ListItem } from '../interfaces';
import { useSortable } from '@dnd-kit/react/sortable';
import DeleteButton from './atoms/DeleteButton';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { useFormContext, type FieldPath } from 'react-hook-form';

type ListElement = {
  item: ListItem;
  globalArrayIndex: number;
  sortableIndex: number;
  listId?: string;
  listRef: HTMLElement | null;
  indent?: boolean;
  depth: number;
  remove: () => void;
};

const ListElem = ({
  item,
  globalArrayIndex,
  sortableIndex,
  listId = '',
  listRef,
  indent,
  remove,
  depth
}: ListElement) => {
  const { ref } = useSortable({
    id: item.listItemId,
    index: sortableIndex,
    type: 'element',
    accept: 'element',
    data: { globalArrayIndex, id: item.listItemId, listId: listId, depth },
    disabled: !listId,
    modifiers: listRef ? [RestrictToElement.configure({ element: listRef })] : []
  });

  const { register } = useFormContext<List>();

  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    remove();
  };

  return (
    <li ref={ref} className={`flex-wrap w-full max-w-[calc(100%-36px)] ${indent ? 'ml-7.75 ' : 'ml-0'} py-1 `}>
      <div className="relative flex items-baseline gap-3  group">
        {listId && (
          <div className='cursor-move size-5 rounded-sm bg-primary/20 shrink-0 flex justify-center text-primary after:content-["⣶"] after:-top-1.5 after:relative' />
        )}
        <input {...register(`content.${globalArrayIndex}.listItemId` as FieldPath<List>)} type="hidden" />
        <input
          type="checkbox"
          data-testid={item.listItemId ? `list-item-${item.listItemId}-checkbox` : ''}

          {...register(`content.${globalArrayIndex}.checked` as FieldPath<List>)}
          className="w-5 h-5 shrink-0 rounded-sm cursor-pointer"
        />
        <textarea
          {...register(`content.${globalArrayIndex}.value` as FieldPath<List>)}
          className={`${item.checked && 'line-through text-gray-400'} border-0 grow text-wrap bg-transparent focus:ring-0 resize-none overflow-hidden py-1 `}
          placeholder="Utwórz listę..."
          // rows={1}
          data-testid={listId ? `card-${listId}-textarea` : 'card-empty-textarea'}

          // onInput={(e) => {
          //   const target = e.target as HTMLTextAreaElement;
          //   target.style.height = 'auto';
          //   target.style.height = `${target.scrollHeight}px`;
          // }}
        />
        <DeleteButton handleRemoveItem={handleRemoveItem} />
      </div>
    </li>
  );
};

export default ListElem;
