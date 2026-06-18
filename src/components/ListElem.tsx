import type { ListItem, SetLocalDataActions } from '../interfaces';
import { useSortable } from '@dnd-kit/react/sortable';
import DeleteButton from './atoms/DeleteButton';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DELETE_BUTTON_W_GAP_SIZE, INDENT_VALUE } from '../consts';
import { useActiveCardIdStore } from '../stores/store';

type ListElement = {
  item: ListItem;
  sortableIndex: number | null;
  listId?: string;
  listRef: HTMLElement | null;
  depth: number;
  isHidden?: boolean;
  actions: SetLocalDataActions,
  list: ListItem[];
  isOverlay?: boolean;
};

const ListElem = ({
  item,
  sortableIndex,
  listId = '',
  listRef,
  depth,
  isHidden,
  actions,
  list,
  isOverlay = false,
}: ListElement) => {
  const { editingCardId, setEditingCardId } = useActiveCardIdStore()
  const { ref, isDragging } = useSortable({
    id: item?.id,
    index: sortableIndex ?? 0,
    type: 'element',
    accept: 'element',
    data: { listId: listId, depth },
    disabled: !listId || isOverlay,
    modifiers: listRef ? [RestrictToElement.configure({ element: listRef })] : []
  });

  const handleRemoveItem = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    if (!editingCardId && listId) {
      setEditingCardId(listId)
    }
    actions.update({ content: list.filter(el => el.id !== item.id) });
  };

  const saveValue = (key, value) => {
    actions.update({
      content: list.map(contentItem => contentItem.id === item.id ? { ...contentItem, [key]: value } : contentItem
      )
    })
  }

  return (

    <li ref={ref} className={`transition-opacity  duration-200 flex-wrap ${isHidden ? 'h-0 opacity-0 pointer-events-none' : 'py-2'} rounded-sm relative flex items-baseline gap-3 group ${isDragging ? 'bg-drag-item-active' : ''}`} style={{
      maxWidth: `calc(100% - ${depth * DELETE_BUTTON_W_GAP_SIZE}px)`,
      marginLeft: `${depth * INDENT_VALUE}px`,
    }}
    >
      {!isHidden &&
        <>
          {listId &&
            <div className='cursor-move size-5 rounded-sm bg-primary/20 shrink-0 flex justify-center text-primary after:content-["⣶"] after:-top-1.5 after:relative' />
          }
          < input
            name={'id'}
            // {...register(`content.${globalArrayIndex}.listItemId` as FieldPath<List>)} 
            value={item.id}
            type="hidden" />
          <input
            type="checkbox"
            data-testid={item?.id ? `list-item-${item?.id}-checkbox` : ''}
            checked={item?.checked}
            // {...register(`content.${globalArrayIndex}.checked` as FieldPath<List>)}
            className="w-5 h-5 shrink-0 rounded-sm cursor-pointer"
            onChange={(e) => saveValue('checked', e.target.checked)}
          />
          <textarea
            value={item?.value}
            name={`${item.id}.value`}
            // {...register(`content.${globalArrayIndex}.value` as FieldPath<List>)}
            className={`${item?.checked && 'line-through text-gray-400'} border-0 grow text-wrap bg-transparent focus:ring-0 resize-none overflow-hidden field-sizing-content`}
            placeholder="Utwórz listę..."
            data-testid={listId ? `card-${listId}-textarea` : 'card-empty-textarea'}
            style={{
              maxWidth: `calc(100% - ${DELETE_BUTTON_W_GAP_SIZE + (INDENT_VALUE * 2)}px)`
            }}
            onChange={(e) => saveValue('value', e.target.value)}
            data-depth={item.depth}
          />
          <DeleteButton handleRemoveItem={handleRemoveItem} />
        </>}
    </li>
  );
};

export default ListElem;