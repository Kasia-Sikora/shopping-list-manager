import { useEffect, useRef } from 'react';
import CardContent from './CardContent';
import type { List } from '../interfaces';
import EditIndicator from './atoms/EditIndicator';
import { useSortable } from '@dnd-kit/react/sortable';
import { useActiveCardIdStore } from '../stores/store';

type Card = {
  emptyCardId?: string,
  editedItem?: List;
  index?: number
  styles?: string
};

const Card = ({ emptyCardId, editedItem, index, styles }: Card) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const { editingCardId, setEditingCardId, resetStates } = useActiveCardIdStore()

  const cardId = editedItem?.id ?? emptyCardId ?? undefined

  const { isDragging } = useSortable({
    id: cardId,
    index: index ?? 0,
    element: cardRef,
    disabled: index === undefined
  })

  useEffect(() => {
    return () => {
      if (editingCardId === cardId) {
        resetStates();
      }
    }
  }, [cardId, editingCardId, resetStates])

  const handleEdit = () => {
    if (editingCardId !== cardId) {
      setEditingCardId(cardId);
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLTextAreaElement)) {
        requestAnimationFrame(() => {
          const el = document.querySelector(
            `[data-id='card-${cardId}'] textarea`
          ) as HTMLTextAreaElement;
          if (el) el.focus();
        })
      }
    }
  };

  const cardDataId = `card-${cardId}`

  return (
    <section
      ref={cardRef}
      onClick={handleEdit}
      className={`${editedItem ? 'w-75' : 'min-w-75'} border-t border-mist-300 shadow-md shadow-shadow flex flex-col align-baseline gap-2 height-10 rounded-lg p-4 relative ${editedItem ? 'pb-8' : 'pb-4'} ${!editedItem ? 'max-w-3xl m-auto' : ''} ${styles} ${isDragging && 'bg-background'}`}
      data-id={cardDataId}
      data-testid={cardDataId}
    >
      {editedItem && <EditIndicator id={editedItem.id} isEdit={editingCardId === cardId} />}
      <CardContent
        editedItem={editedItem}
        cardRef={cardRef}
        cardDataId={cardDataId}
        cardIndex={index}
        cardId={cardId}
      />
    </section>
  );
};

export default Card;
