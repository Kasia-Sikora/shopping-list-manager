import type { ListItem, SetLocalDataActions } from '../interfaces';
import { useSortable } from '@dnd-kit/react/sortable';
import DeleteButton from './atoms/DeleteButton';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DELETE_BUTTON_W_GAP_SIZE, INDENT_VALUE } from '../consts';
import { useActiveCardIdStore } from '../stores/store';
import { useDragOperation } from '@dnd-kit/react';

function DraggingIndicator() {
  const { source } = useDragOperation();

  if (!source) return null;

  return (
    <div role="status" aria-live="polite" className='absolute top-0 bg-accent w-full h-0.5'>
      {/* Dragging <strong>{String(source.id)}</strong>
      {target ? <> over <strong>{String(target.id)}</strong></> : ' over no target'} */}
    </div>
  );
}

const config = {
  alignment: {
    x: 'start',
    y: 'start',
  },
  // transition: {
  //   // duration: 200,
  //   idle: true,
  // },
} as const;


type ListElement = {
  item: ListItem;
  sortableIndex: number | null;
  listId?: string;
  listRef: HTMLElement | null;
  depth: number;
  actions: SetLocalDataActions,
  list: ListItem[];
  isOverlay?: boolean;
  isActive?: boolean
};

const ListElem = ({
  item,
  sortableIndex,
  listId = '',
  listRef,
  depth,
  actions,
  list,
  isOverlay = false,
  isActive = false
}: ListElement) => {
  const { editingCardId, setEditingCardId } = useActiveCardIdStore()
  const { ref, handleRef, isDragging, isDragSource } = useSortable({
    ...config,
    id: item?.id,
    index: sortableIndex ?? 0,
    data: { listId: listId, depth, item: item },
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

  const saveValue = (key: string, value: string | boolean) => {
    actions.update({
      content: list.map(contentItem => contentItem.id === item.id ? { ...contentItem, [key]: value } : contentItem
      )
    })
  }

  return (
      <li ref={ref} className={`relative transition-opacity duration-200 flex-wrap ${isDragSource && !isOverlay ? 'opacity-60' : 'opacity-100'} overflow-hidden whitespace-nowrap rounded-sm relative flex items-baseline  gap-3 group py-2 ${isDragging ? 'bg-drag-item-active' : ''} `} style={{
        maxWidth: `calc(100% - ${depth * DELETE_BUTTON_W_GAP_SIZE}px)`,
        marginLeft: `${depth * INDENT_VALUE}px`
      }}
      >
        {isActive && !isOverlay && <DraggingIndicator/>}

        {listId &&
          <div ref={handleRef} className='cursor-move size-5 rounded-sm bg-primary/20 shrink-0 flex justify-center text-primary after:content-["⣶"] after:-top-1.5 after:relative' />
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
          className={`${item?.checked ? 'line-through text-gray-400': ''} transition-all border-0 grow text-wrap bg-transparent focus:ring-0 resize-none field-sizing-content ${isOverlay? 'overflow-hidden text-nowrap max-h-6 field-sizing-fixed':''} `}
          placeholder="Utwórz listę..."
          data-testid={listId ? `card-${listId}-textarea` : 'card-empty-textarea'}
          style={{
            maxWidth: `calc(100% - ${DELETE_BUTTON_W_GAP_SIZE + (INDENT_VALUE * 2)}px)`,
            minWidth: `calc(100% - ${DELETE_BUTTON_W_GAP_SIZE + (INDENT_VALUE * 2)}px)`,
            // textOverflow: 'ellipsis',
          }}
          onChange={(e) => saveValue('value', e.target.value)}
          data-depth={item.depth}
        />
        <DeleteButton handleRemoveItem={handleRemoveItem} />
      </li>
  );
};

export default ListElem;