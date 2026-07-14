import type { ListItem, SetLocalDataActions } from '../interfaces';
import { useSortable } from '@dnd-kit/react/sortable';
import DeleteButton from './atoms/DeleteButton';
import { RestrictToElement } from '@dnd-kit/dom/modifiers';
import { DELETE_BUTTON_W_GAP_SIZE, INDENT_VALUE } from '../consts';
import { useActiveCardIdStore } from '../stores/store';
import { useDragOperation } from '@dnd-kit/react';
import { useMemo, memo, useState } from 'react';
import DragHandleIcon from '../assets/dragHandle.svg?react' 

function DraggingIndicator() {
  const { source } = useDragOperation();

  if (!source) return null;

  return (
    <div role="status" aria-live="polite" aria-label="Dragging" className='absolute top-0 bg-accent w-full h-0.5' />
  );
}

const config = {
  alignment: {
    x: 'start',
    y: 'start',
  },
} as const;


type ListElement = {
  item: ListItem;
  sortableIndex?: number;
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
  const { editingCardId, setEditingCardId, focusItemId, setFocusItemId } = useActiveCardIdStore()
  const [tempValue, setTempValue] = useState(item.value);

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
    e.preventDefault()
    if (!editingCardId && listId) {
      setEditingCardId(listId)
    }
    actions.update({ content: list.filter(el => !(el.id === item.id || el.parentId === item.id)) });
  };

  const saveValue = (key: string, value: string | boolean) => {
    actions.update({
      content: list.map(contentItem => contentItem.id === item.id ? { ...contentItem, [key]: value } : contentItem
      )
    })
  }

  const handleBlur = () => {
    if (tempValue !== item.value) {
      saveValue('value', tempValue)
    }
  }

  const liStyles = useMemo(() => ({
    maxWidth: `calc(100% - ${depth * DELETE_BUTTON_W_GAP_SIZE}px)`,
    marginLeft: `${depth * INDENT_VALUE}px`
  }), [depth])

  return (
    <li ref={ref} className={`relative transition-opacity duration-200 flex-nowrap ${isDragSource && !isOverlay ? 'opacity-50' : 'opacity-100'} overflow-hidden whitespace-nowrap rounded-sm relative flex items-baseline gap-3 group py-2 ${isDragging ? 'bg-drag-item-active' : ''}`} style={liStyles}>
      {isActive && !isOverlay && <DraggingIndicator />}


      {listId && (
        <button
          ref={handleRef}
          type="button"
          aria-label={`Drag to reorder: ${item.value || 'item'}`}
          aria-roledescription="drag handle"
          className='relative top-1.25 cursor-move size-6 rounded-sm bg-primary/20 shrink-0 flex justify-center hover:bg-primary/30'
        >
          <DragHandleIcon />
        </button>
      )}
      <input name="id" value={item.id} type="hidden" />
      <div role="group" aria-labelledby={`item-${item.id}`} className="grow overflow-hidden whitespace-nowrap flex items-baseline gap-3 pt-0.5">
        <input
          type="checkbox"
          data-testid={item?.id ? `list-item-${item?.id}-checkbox` : ''}
          checked={item?.checked}
          className="size-6 shrink-0 rounded-sm cursor-pointer before:bg-accent"
          onChange={(e) => saveValue('checked', e.target.checked)}
          aria-label={`Done: ${item.value || 'unnamed item'}`}
        />
        <textarea
          id={`item-${item.id}`}
          value={tempValue}
          name={`${item.id}.value`}
          className={`${item?.checked ? 'line-through text-muted' : ''} transition-all border-0 grow text-wrap bg-transparent placeholder:text-primary/50 focus:ring-0 resize-none field-sizing-content ${isOverlay ? 'overflow-hidden text-nowrap max-h-6 field-sizing-fixed' : ''}`}
          data-testid={listId ? `card-${listId}-textarea` : 'card-empty-textarea'}
          style={{
            maxWidth: `calc(100% - ${DELETE_BUTTON_W_GAP_SIZE + INDENT_VALUE}px)`,
            minWidth: `calc(100% - ${DELETE_BUTTON_W_GAP_SIZE + INDENT_VALUE}px)`
          }}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => { if (focusItemId === item.id) setFocusItemId(null); }}
          autoFocus={!isOverlay && item.id === focusItemId}
          data-depth={item.depth}
          aria-describedby={`item-desc-${item.id}`}
          placeholder='Utwórz listę...'
        />
        <span id={`item-desc-${item.id}`} className="sr-only">{tempValue ?? 'Utwórz listę...'}</span>
      </div>

      <DeleteButton ariaLabel={`Delete: ${item.value || 'unnamed item'}`} handleRemoveItem={handleRemoveItem} />
    </li>
  );
};

export default memo(ListElem);