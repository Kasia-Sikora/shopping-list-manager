type AddListItemButtonProps = {
  handleCreateNewLine: (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => void;
};

const AddListItemButton = ({ handleCreateNewLine }: AddListItemButtonProps) => {
  return (
    <button
      onClick={handleCreateNewLine}
      className="self-start font-bold text-secondary text-shadow-primary hover:text-accent "
    >
      + Element listy
    </button>
  );
};

export default AddListItemButton;
