import { useStore } from "../../stores/store";
import type { FieldListItem } from "../../interfaces";
import { type UseFieldArrayRemove } from "react-hook-form";

type MenuButton = {
  openMenu: boolean;
  cardId: string;
  setOpenMenu: (value: boolean) => void;
  fields: FieldListItem[]
  remove: UseFieldArrayRemove
}

const MenuButton = ({ cardId, openMenu, setOpenMenu, fields, remove }: MenuButton) => {
  return (
    <>
      <button className="absolute bottom-1.5 right-1.5 rounded-full size-7 hover:cursor-pointer" aria-label={openMenu ? 'close menu' : 'open menu'} onClick={(e) => { e.stopPropagation(); setOpenMenu(!openMenu) }}>
        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-accent size-6" />
        <div className="size-7 absolute bottom-0 border-3 bg-white/40 transition-all duration-200 hover:bg-white/75 border-mist-700 rounded-full">
          <div className='size-7 absolute text-mist-800 bottom-0 after:content-["\2807"] rounded-full after:text-2xl' />
        </div>
      </button>
      <MenuDropdown open={openMenu} cardId={cardId} setOpen={setOpenMenu} fields={fields} remove={remove} />
    </>
  );
};

export default MenuButton;


type MenuDropdown = {
  open: boolean;
  cardId: string;
  setOpen: (value: boolean) => void
  fields: FieldListItem[]
  remove: UseFieldArrayRemove
}

type MenuOperationTypes =
  | 'remove'
  | 'copy'
  | 'removeChecked';


const MenuDropdown = ({ open, cardId, setOpen, fields, remove }: MenuDropdown) => {

  const { copyCard, removeCard } = useStore()
  const popoverPlacement = () => {
    // return { 'translate(70px, 100px)'}
    return ({ position: 'absolute', margin: '0px', bottom: '35px', right: '0px' }) as React.CSSProperties
  }

  const removeCheckedItemsFromFieldsArray = () => {
    for (let i = fields.length - 1; i >= 0; i--) {
      if (fields[i].checked) {
        remove(fields[i].globalArrayIndex)
      }
    }
  }

  const handleMenuClick = (operation: MenuOperationTypes) => {
    switch (operation) {
      case "remove":
        removeCard(cardId)
        break;
      case "copy":
        copyCard(cardId)
        break;
      case "removeChecked":
        removeCheckedItemsFromFieldsArray()
        break;
    }
    setOpen(false)
  }

  return (
    <div id="dropdown" className={`z-10 ${!open ? 'hidden' : ''} bg-menu-bg border border-mist-400 shadow-md shadow-shadow rounded-md w-auto`} aria-label="dropdown" style={{ ...popoverPlacement() }}>
      <ul className="p-2 text-sm font-medium" aria-labelledby="dropdownDefaultButton">
        <li className="w-full"><button className="p-2 hover:text-secondary text-start hover:bg-menu-active hover:cursor-pointer w-full rounded" aria-label='delete card' onClick={() => handleMenuClick('remove')}>Usuń kartę</button></li>
        <li className="w-full"><button className="p-2 text-start text-gray-500 w-full rounded" disabled>Dodaj współpracownika</button></li>
        <li className="w-full"><button className="p-2 hover:text-secondary text-start hover:bg-menu-active hover:cursor-pointer w-full rounded" aria-label='copy card' onClick={() => handleMenuClick('copy')}>Utwórz kopię</button></li>
        <li className="w-full"><button className="p-2 hover:text-secondary text-start hover:bg-menu-active hover:cursor-pointer w-full rounded" aria-label='delete all checked items' onClick={() => handleMenuClick('removeChecked')}>Usuń zaznaczone elementy</button></li>
      </ul>
    </div>
  )
}