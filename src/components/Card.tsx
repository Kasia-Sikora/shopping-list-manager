import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import CardContent from './CardContent';
import type { List, SetLocalDataActions } from '../interfaces';
import EditIndicator from './atoms/EditIndicator';
import { useSortable } from '@dnd-kit/react/sortable';
import { useActiveCardIdStore, useStore, useSyncStore } from '../stores/store';
import { generateId } from '../utils/utils';
import { EMPTY_CARD_ID } from '../consts';
import { dbActions } from '../utils/storeUtils';

type Card = {
  emptyCardId?: string;
  editedList?: List;
  index?: number
  styles?: string
};

const Card = ({ emptyCardId, editedList, index, styles }: Card) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const { isSaving, setIsSaving } = useSyncStore();

  const { addList, updateList } = useStore()
  const { editingCardId, setEditingCardId } = useActiveCardIdStore()

  const cardId = editedList?.id ?? emptyCardId;
  const [emptyCardResetKey, setEmptyCardResetKey] = useState(0);

  //Workaround for creating ugly Union type. editedList.id OR emptyCardId will be always provided.
  if (!cardId) {
    throw new Error('Card requires either editedList with id or emptyCardId');
  }

  const { isDragging } = useSortable({
    id: cardId,
    index: index ?? 0,
    element: cardRef,
    disabled: index === undefined
  })

  const defaultValues: List = useMemo(() => editedList
    ? editedList
    : {
      id: generateId(),
      title: '',
      content: [{ id: generateId(), value: '', checked: false, depth: 0, parentId: null }],
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editedList, emptyCardResetKey]); //emptyCardResetKey is used to trigger creating new values for fresh empty card

  const [localDraft, setLocalDraft] = useState<List | null>(null);


  const currentData = localDraft || defaultValues;

  const cardDataId = `card-${cardId}`

  const handleEdit = (e: React.MouseEvent) => {
    if (editingCardId === cardId) return;
    setLocalDraft(defaultValues);
    setEditingCardId(cardId);
    const target = e.target as HTMLElement;

    if (
      target.tagName === 'BUTTON' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea')
    ) {
      return; // Interactive element clicked, don't edit
    }

    const el = document.querySelector(
      `[data-id='card-${cardId}'] textarea`
    ) as HTMLTextAreaElement;
    if (el) el.focus();
  }

  const saveOrUpdateData = useCallback(async (data: List) => {
    setIsSaving(true)
    const isItemExists = useStore.getState().lists.some(l => l.id === data.id);
    if (cardId === EMPTY_CARD_ID && !isItemExists) {
      const newItem = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
      };
      addList(newItem)
      try {
        await dbActions({ action: "create", data: newItem })
      } catch (error) {
        console.error('Failed to save list:', error);
      } finally {
        setIsSaving(false)
      }
    } else {
      const updatedItem = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      updateList(updatedItem)
      try {
        await dbActions({ action: "update", data: updatedItem })
      } catch (error) {
        console.error('Failed to update list:', error);
      }
      finally {
        setIsSaving(false)
      }
    }
  }, [addList, cardId, setIsSaving, updateList])

  const handleResetLocalState = useCallback(() => {
    setLocalDraft(null);
    setEditingCardId(null);
    if (!editedList) {
      setEmptyCardResetKey(prev => prev + 1);
    }
  }, [editedList, setEditingCardId]);

  const actions: SetLocalDataActions = useMemo(() => ({
    update: (updates: Partial<List>) => {
      setLocalDraft(prev => ({ ...(prev || currentData), ...updates }));
    },
    sync: async (dataToSync: List) => {
      await saveOrUpdateData(dataToSync)
    },
    save: async (dataToSave: List) => {
      await saveOrUpdateData(dataToSave)
      handleResetLocalState();
    },
    resetLocalState: handleResetLocalState
  }), [handleResetLocalState, currentData, saveOrUpdateData]);


  useEffect(() => {
    if (!localDraft) return;
    const timer = setTimeout(() => {
      if (cardId === EMPTY_CARD_ID) return
      actions.sync(localDraft);
    }, 1000); // Save after 1 second of inactivity

    return () => clearTimeout(timer);
  }, [actions, cardId, localDraft]);

  return (
    <div
      ref={cardRef}
      onClick={handleEdit}
      className={`${editedList ? 'w-75' : 'min-w-75'} border-t border-mist-300 shadow-md shadow-shadow flex flex-col align-baseline gap-2 height-10 rounded-lg p-4 relative ${editedList ? 'pb-8' : 'pb-4'} ${!editedList ? 'max-w-3xl m-auto' : ''} ${styles} ${isDragging && 'bg-background'}`}
      data-id={cardDataId}
      data-testid={cardDataId}
    >
      {editedList && <EditIndicator id={editedList.id} isEdit={editingCardId === cardId} />}
      {isSaving && <div className='absolute right-2 top-2  w-6 aspect-square rounded-full border-6 border-primary border-solid border-r-accent animate-spin'></div>}
      <CardContent
        editedList={currentData}
        cardRef={cardRef}
        cardDataId={cardDataId}
        cardId={cardId}
        actions={actions}
      />
    </div>
  );
};


export default Card