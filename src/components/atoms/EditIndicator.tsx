type EditIndicator = {
  id: string;
  isEdit: boolean;
};

const EditIndicator = ({ id, isEdit }: EditIndicator) => {
  return (
    <div
      data-testid={`card-${id}-edit-indicator`}
      className={`transition-opacity duration-300 ${isEdit ? 'opacity-100' : 'opacity-0'}`}
      aria-hidden={`${isEdit ? 'false' : 'true'}`}
    >
      <div className={`absolute -top-1 -left-2.5 size-8 rounded-full bg-accent `} />
      <div className={`absolute -top-2 -left-3.5 size-8 rounded-full border-3 border-mist-700 `} />
      <div className={`absolute -top-1 -left-1.5 size-8 `} />
      <div className={`tick absolute -top-0.5 -left-0.5 w-2 h-4 inset-shadow-[-3px_-3px_#161b1d] rotate-45 `} />
    </div>
  );
};

export default EditIndicator;
