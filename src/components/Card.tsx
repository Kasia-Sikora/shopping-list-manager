import { useEffect, useMemo, useRef, useState } from 'react';
import CardContent from './CardContent';
import type { List, SetLocalDataActions } from '../interfaces';
import EditIndicator from './atoms/EditIndicator';
import { useSortable } from '@dnd-kit/react/sortable';
import { useActiveCardIdStore, useStore } from '../stores/store';
import { generateId } from '../utils/utils';
import { DEFAULT_CONTENT, EMPTY_CARD_ID } from '../consts';

type Card = {
  emptyCardId?: string,
  editedList?: List;
  index?: number
  styles?: string
};

const Card = ({ emptyCardId, editedList, index, styles }: Card) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const { addList, updateList } = useStore()
  const { editingCardId, setEditingCardId } = useActiveCardIdStore()

  const cardId = editedList?.id ?? emptyCardId ?? undefined

  const { isDragging } = useSortable({
    id: cardId,
    index: index ?? 0,
    element: cardRef,
    disabled: index === undefined
  })

  const defaultValues: List = useMemo(() => editedList
    ? editedList
    : {
      id: null,
      title: '',
      content: DEFAULT_CONTENT,
    }, [editedList]);

  const [localDraft, setLocalDraft] = useState<List | null>(null);

  const currentData = localDraft || defaultValues;

  const cardDataId = `card-${cardId}`

  const handleEdit = () => {
    // e.stopPropagation();
    if (editingCardId === cardId) return;
    setLocalDraft(defaultValues);
    setEditingCardId(cardId);

    const activeElement = document.activeElement;

    if (activeElement instanceof (HTMLTextAreaElement) ||
      activeElement instanceof (HTMLInputElement) ||
      activeElement instanceof (HTMLButtonElement)) {
      return;
    } else {
      const el = document.querySelector(
        `[data-id='card-${cardId}'] textarea`
      ) as HTMLTextAreaElement;
      if (el) el.focus();
    }
  }

  const actions: SetLocalDataActions = useMemo(() => ({
    update: (updates: Partial<List>) => {
      setLocalDraft(prev => ({ ...(prev || currentData), ...updates }));
    },
    sync: (dataToSync: List) => {
      if (cardId === 'empty') return;
      updateList(dataToSync);
    },
    save: (dataToSave: List) => {
      if (cardId === EMPTY_CARD_ID) {
        addList({...dataToSave, id: generateId()})
      } else {
        updateList(dataToSave)
      }
      actions.resetLocalState();
    },
    resetLocalState: () => {
      setLocalDraft(null); // Clear local memory
      setEditingCardId(null);
    }
  }), [addList, cardId, currentData, setEditingCardId, updateList]);


  useEffect(() => {
    if (!localDraft || cardId === EMPTY_CARD_ID) return;
    if (cardId === 'empty') return;
    const timer = setTimeout(() => {
      actions.sync(localDraft);
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timer);
  }, [actions, cardId, localDraft]);

  return (
    <section
      ref={cardRef}
      onClick={handleEdit}
      className={`${editedList ? 'w-75' : 'min-w-75'} border-t border-mist-300 shadow-md shadow-shadow flex flex-col align-baseline gap-2 height-10 rounded-lg p-4 relative ${editedList ? 'pb-8' : 'pb-4'} ${!editedList ? 'max-w-3xl m-auto' : ''} ${styles} ${isDragging && 'bg-background'}`}
      data-id={cardDataId}
      data-testid={cardDataId}
    >
      {editedList && <EditIndicator id={editedList.id} isEdit={editingCardId === cardId} />}
      <CardContent
        editedList={currentData}
        cardRef={cardRef}
        cardDataId={cardDataId}
        cardIndex={index}
        cardId={cardId}
        actions={actions}
      />
    </section>
  );
};


export default Card