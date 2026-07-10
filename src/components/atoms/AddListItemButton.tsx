import PlusIcon from '../../assets/plusSign.svg?react'

type AddListItemButtonProps = {
  handleCreateNewLine: (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => void;
};

const AddListItemButton = ({ handleCreateNewLine }: AddListItemButtonProps) => {
  return (
    <button
      onClick={handleCreateNewLine}
      className="flex items-center gap-2 self-start font-medium text-secondary text-shadow-primary hover:text-text-active "
    >
      <PlusIcon className='size-4'/> Element listy
    </button>
  );
};

export default AddListItemButton;
