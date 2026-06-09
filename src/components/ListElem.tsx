import type { ListItem } from '../interfaces';
import { useStore } from '../stores/store';
import { useSortable } from '@dnd-kit/react/sortable';
import DeleteButton from './atoms/DeleteButton';
import { useFieldArrayFormContext } from '../AllFormMethodsProvider';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';

type ListElement = {
  item: ListItem;
  fieldArrayId: number;
  sortableIndex: number;
  listId?: string;
  listRef: HTMLLIElement;
  indent?: boolean
  children: HTMLULElement
};

const ListElement = ({ item, fieldArrayId, sortableIndex, listId = '', listRef, indent, children }: ListElement) => {
  const { checkItem, removeItem } = useStore();

  const { ref } = useSortable({
    id: `card-${listId}-item-${item.listItemId}`,
    index: sortableIndex,
    type: children? 'parent element': 'element',
    accept: 'element',
    data: { fieldArrayId, id: item.listItemId, listId: listId },
    disabled: !listId,
    modifiers: [RestrictToElement.configure({
      element: listRef
    })]
  });

  const { register, update, getValues, remove } = useFieldArrayFormContext()

  const handleCheck = (index: number, itemId: string, checked: boolean) => {
    const { listItemId, value } = getValues(`content.${index}`);
    update(index, { listItemId, checked: checked, value });
    checkItem(itemId, index, checked);
  };

  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.preventDefault();
    removeItem(listId, item.listItemId);
    remove(fieldArrayId);
  };

  return (
    <>
      {/* TODO remove custom className */}
      <li ref={ref} className={`listItem relative flex ${children?'flex-col':'flex' }items-baseline gap-3 flex-wrap ${!sortableIndex ? 'w-full -mr-8.75' : 'w-[calc(100%-35px)] '} ${indent ? 'pl-7.75' : 'pl-0'} py-2`}>
        <div className={`listItem relative flex items-baseline gap-3`}>
          {listId && <div className='cursor-move size-5 rounded-sm bg-primary/20 shrink-0 flex justify-center align-baseline text-primary after:text-s after:content-["⣶"] after:-top-1.5 after:relative' />}
          <input {...register(`content.${fieldArrayId}.listItemId` as const)} type="hidden" />
          <input
            type="checkbox"
            checked={item.checked}
            disabled={!item}
            data-testid={item.listItemId ? `list-item-${item.listItemId}-checkbox` : ''}
            onChange={(e) => {
              handleCheck(fieldArrayId, listId, e.target.checked);
            }}
            className="w-6 h-6 shrink-0"
          />
          <textarea
            {...register(`content.${fieldArrayId}.value` as const)}
            className={`${item.checked && 'line-through text-gray-500'} border-0 text-wrap`}
            placeholder="Utwórz listę..."
            data-testid={listId ? `card-${listId}-textarea` : 'card-empty-textarea'}
          />
          {item && (
            <DeleteButton handleRemoveItem={handleRemoveItem} indent={indent} />
          )}
         
        </div>
         {children}
      </li>
    </>
  );
};

export default ListElement;
