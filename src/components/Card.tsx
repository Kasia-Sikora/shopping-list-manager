import { useRef, useState } from 'react';
import CardContent from './CardContent';
import type { List } from '../interfaces';
import EditIndicator from './atoms/EditIndicator';
import MenuButton from './atoms/MenuButton';

type Card = {
  editedItem?: List;
};

const Card = ({ editedItem }: Card) => {
  const [edit, setEdit] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    if (!edit) {
      setEdit(true);
      const activeElement = document.activeElement;
      if (!(activeElement instanceof HTMLTextAreaElement)) {
        const el = document.querySelector(
          `[data-id='card-${editedItem?.id ? editedItem.id : 'empty'}'] textarea`
        ) as HTMLTextAreaElement;
        if (el) el.focus();
      }
    }
  };

  const cardDataId = editedItem ? `card-${editedItem.id}` : 'card-empty';

  return (
    <section
      ref={cardRef}
      onClick={handleEdit}
      className={`${editedItem? 'w-75': 'min-w-75'} border-t border-mist-300 shadow-md shadow-shadow flex flex-col align-baseline gap-2 height-10 rounded-lg p-4 relative ${editedItem ? 'pb-8' : 'pb-4'} ${!editedItem && 'w-3xl m-auto'}`}
      data-id={cardDataId}
      data-testid={cardDataId}
    >
      {editedItem && <EditIndicator id={editedItem.id} isEdit={edit} />}
      <CardContent
        cardEdit={edit}
        setEditCard={setEdit}
        editedItem={editedItem}
        cardRef={cardRef}
        cardDataId={cardDataId}
      />
      {editedItem && <MenuButton />}
    </section>
  );
};

export default Card;
