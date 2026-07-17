import PlusIcon from '../../assets/plusSign.svg?react'
import { useTranslation } from '../../hooks/useTranslationHook';

type AddListItemButtonProps = {
  handleCreateNewLine: (e: React.KeyboardEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>) => void;
};

const AddListItemButton = ({ handleCreateNewLine }: AddListItemButtonProps) => {
  const t = useTranslation()
  return (
    <button
      onClick={handleCreateNewLine}
      className="flex items-center gap-2 self-start font-medium text-secondary text-shadow-primary hover:text-text-active cursor-pointer"
    >
      <PlusIcon className='size-4'/> {t('card.listItem.buttons.addElementButton')}
    </button>
  );
};

export default AddListItemButton;
