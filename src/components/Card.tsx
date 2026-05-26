import { useRef, useState } from 'react';
import ListComponent from './CardContent';

const Card = () => {
  const [edit, setEdit] = useState<boolean>(false);

  const cardRef = useRef<HTMLDivElement>(null);

  const handleEdit = () => {
    if (!edit) {
      setEdit(true);
    }
  };

  return (
    <div
      ref={cardRef}
      onClick={handleEdit}
      className="border-t border-mist-300 shadow-md shadow-mist-400 flex flex-col align-baseline gap-2 height-10 rounded-lg p-4 w-3xl m-auto"
      data-id={'empty-card'}
      data-testid='empty-card'
    >
      <ListComponent cardEdit={edit} setEditCard={setEdit} cardRef={cardRef} />
    </div>
  );
};

export default Card;
