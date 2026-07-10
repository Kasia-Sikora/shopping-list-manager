import type { List, SetLocalDataActions } from "../../interfaces";
import { useActiveCardIdStore, useStore } from "../../stores/store";
import { dbActions } from "../../utils/storeUtils";
import * as db from '../../services/indexedDB'
import { generateId } from "../../utils/utils";
import TrashIcon from '../../assets/trash.svg?react'

type MenuButton = {
  openMenu: boolean;
  cardId: string;
  setOpenMenu: (value: boolean) => void;
  list: List;
  actions: SetLocalDataActions
}

const MenuButton = ({ cardId, openMenu, setOpenMenu, list, actions }: MenuButton) => {
  return (
    <>
      <button className="absolute bottom-1.5 right-1.5 rounded-full size-7 hover:cursor-pointer" aria-label={openMenu ? 'close menu' : 'open menu'} onClick={(e) => { e.stopPropagation(); setOpenMenu(!openMenu) }}>
        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-accent size-6" />
        <div className="size-7 absolute bottom-0 border-3 bg-white/40 transition-all duration-200 hover:bg-white/75 border-muted-graphic rounded-full">
          <div className='size-7 absolute text-on-accent bottom-0 after:content-["\2807"] rounded-full after:text-2xl' />
        </div>
      </button>
      <MenuDropdown open={openMenu} cardId={cardId} setOpen={setOpenMenu} list={list} actions={actions} />
    </>
  );
};

export default MenuButton;


type MenuDropdown = {
  open: boolean;
  cardId: string;
  setOpen: (value: boolean) => void;
  list: List;
  actions: SetLocalDataActions
}

type MenuOperationTypes =
  | 'remove'
  | 'copy'
  | 'removeChecked';


const MenuDropdown = ({ open, cardId, setOpen, list, actions }: MenuDropdown) => {

  const { copyList, removeList, removeCheckedListItems } = useStore()
  const { editingCardId } = useActiveCardIdStore()
  const popoverPlacement = () => {
    // return { 'translate(70px, 100px)'}
    return ({ position: 'absolute', margin: '0px', bottom: '35px', right: '0px' }) as React.CSSProperties
  }

  const removeCheckedItems = async () => {
    const filteredList = list.content.filter(item => !item.checked)
    if (cardId === editingCardId) {
      actions.update({ content: filteredList })
    } else {
      removeCheckedListItems(cardId)
      const list = await db.getList(cardId);
      if (list) {
        const updatedItem = {
          ...list,
          content: list.content.filter((el) => !el.checked),
          updatedAt: new Date().toISOString(),
        };
        try {
          await dbActions({ action: 'update', data: updatedItem })
        } catch (error) {
          console.error('Failed to delete checked items in list:', error);
        }
      } else {
        console.warn(`item not updated to IndexedDB, list with id: ${cardId} was not found`)
        throw Error(`item not updated to IndexedDB, list with id: ${cardId} was not found`)
      }
    }
  }

  const copyIntoDB = async (newId: string) => {
    const list = await db.getList(cardId);
    if (list) {
      const copiedItem = {
        ...list,
        title: `${list.title}-copy`,
        id: newId,
        createdAt: new Date().toISOString(),
      };
      try {
        await dbActions({ action: 'create', data: copiedItem })
      } catch (error) {
        console.error('Failed to save list:', error);
      }
    } else {
      console.warn(`item not copied to IndexedDB, list with id: ${cardId} was not found`)
      throw Error(`item not copied to IndexedDB, list with id: ${cardId} was not found`)
    }
  }

  const handleMenuClick = async (e: React.MouseEvent, operation: MenuOperationTypes) => {
    e.stopPropagation();
    switch (operation) {
      case "remove":
        removeList(cardId)
        try {
          await dbActions({ action: 'delete', data: { id: cardId } })
        } catch (error) {
          console.error('Failed to remove list:', error);
        }
        break;
      case "copy":
        {
          const newId = generateId()
          copyList(cardId, newId);
          try {
            await copyIntoDB(newId)
          } catch (error) {
            console.error('Failed to copy list:', error);
          }
          break;
        }
      case "removeChecked":
        removeCheckedItems()
        break;
    }
    setOpen(false)
  }

  return (
    <div id="dropdown" className={`z-10 ${!open ? 'hidden' : ''} bg-menu-bg border border-border rounded-md w-auto`} aria-label="dropdown" style={{ ...popoverPlacement() }}>
      <ul className="p-2 text-sm font-medium" aria-labelledby="dropdownDefaultButton">
        <li className="w-full hover:bg-red-100 rounded"><button className="p-2 text-red-700 text-start hover:cursor-pointer w-full rounded flex items-center" aria-label='delete card' onClick={(e) => handleMenuClick(e, 'remove')}>Usuń kartę <TrashIcon className="relative top-0.5 left-1"/></button></li>
        <li className="w-full"><button className="p-2 text-start text-muted-graphic/70 w-full rounded" disabled>Dodaj współpracownika</button></li>
        <li className="w-full"><button className="p-2 hover:text-secondary text-start hover:bg-menu-active hover:cursor-pointer w-full rounded" aria-label='copy card' onClick={(e) => handleMenuClick(e, 'copy')}>Utwórz kopię</button></li>
        <li className="w-full"><button className="p-2 hover:text-secondary text-start hover:bg-menu-active hover:cursor-pointer w-full rounded" aria-label='delete all checked items' onClick={(e) => handleMenuClick(e, 'removeChecked')}>Usuń zaznaczone elementy</button></li>
      </ul>
    </div>
  )
}