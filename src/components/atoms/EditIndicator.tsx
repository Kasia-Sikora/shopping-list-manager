import Tick from '../../assets/tick.svg?react'

type EditIndicator = {
  id: string;
  isEdit: boolean;
};

const EditIndicator = ({ id, isEdit }: EditIndicator) => {
  return (
    <div
      data-testid={`card-${id}-edit-indicator`}
      className={`relative -top-5 -left-5 transition-opacity duration-300 ${isEdit ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={isEdit}
    >
      <div className={`absolute -top-1 -left-2.5 size-8 rounded-full bg-accent `} />
      <div className={`absolute -top-1 -left-2.5 size-8 rounded-full border-3 border-card outline-2 outline-secondary `} />
      <Tick className='absolute text-card -left-1.5'/>
    </div>
  );
};

export default EditIndicator;
