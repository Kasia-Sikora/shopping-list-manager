import { useRef, useState } from 'react';
import CardContent from './CardContent';
import type { List } from '../interfaces';
import EditIndicator from './atoms/EditIndicator';
import MenuButton from './atoms/MenuButton';

const Card = ({ editedItem }: { editedItem?: List }) => {
  const [edit, setEdit] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    if (!edit) {
      setEdit(true);
    }
  };

  const cardDataId = editedItem ? `card-${editedItem.id}` : 'empty-card'

  return (
    <div
      ref={cardRef}
      draggable={!!editedItem}
      onClick={handleEdit}
      className={`border-t border-mist-300 shadow-md shadow-mist-400 flex flex-col align-baseline gap-2 height-10 rounded-lg p-4 relative ${editedItem? "pb-8": "pb-4"} ${!editedItem && "w-3xl m-auto"}`}
      data-id={cardDataId}
      data-testid={cardDataId}
    >
      {editedItem && <EditIndicator id={editedItem.id} isEdit={edit} />}
      <CardContent cardEdit={edit} setEditCard={setEdit} editedItem={editedItem} cardRef={cardRef} cardDataId={cardDataId}/>
      {editedItem && <MenuButton />}
    </div >
  );
};

export default Card;
