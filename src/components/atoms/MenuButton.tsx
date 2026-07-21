import type { List, SetLocalDataActions } from "../../interfaces";
import { useActiveCardIdStore, usePopoverIdStore, useStore } from "../../stores/store";
import { dbActions } from "../../utils/storeUtils";
import * as db from '../../services/indexedDB'
import { generateId } from "../../utils/utils";
import TrashIcon from '../../assets/trash.svg?react'
import MenuIcon from '../../assets/menu.svg?react'
import { useTranslation } from "../../hooks/useTranslationHook";
import Popover from "./Popover";

type MenuButton = {
  cardId: string;
  list: List;
  actions: SetLocalDataActions
}

const MenuButton = ({ cardId, list, actions }: MenuButton) => {
  const t = useTranslation()
  const setOpenPopoverId = usePopoverIdStore(s => s.setOpenPopoverId)
  const isOpen = usePopoverIdStore((s) => s.openPopoverId === `${cardId}-menu`)

  const ariaLabel = isOpen ? t('card.menuPopover.closeMenuAriaButton') : t('card.menuPopover.openMenuAriaButton')

  return (
    <>
      <button aria-expanded={isOpen} aria-controls={`${cardId}-menu`} className="absolute bottom-1.5 right-1.5 rounded-full size-7 hover:cursor-pointer" aria-label={ariaLabel} onClick={(e) => { e.stopPropagation(); setOpenPopoverId(!isOpen ? `${cardId}-menu` : null) }}>
        <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-secondary size-6" />
        <div className="size-7 absolute bottom-0 border-3 bg-white/40 transition-all duration-200 hover:bg-white/75 border-muted-graphic rounded-full">
          <MenuIcon className='relative text-on-accent right-px bottom-px' />
        </div>
      </button>
      <MenuDropdown cardId={cardId} list={list} actions={actions} />
    </>
  );
};

export default MenuButton;


type MenuDropdown = {
  cardId: string;
  list: List;
  actions: SetLocalDataActions
}

type MenuOperationTypes =
  | 'remove'
  | 'copy'
  | 'removeChecked';


const MenuDropdown = ({ cardId, list, actions }: MenuDropdown) => {
  const closePopover = usePopoverIdStore(s => s.closePopover)
  const copyList = useStore(s => s.copyList)
  const removeList = useStore(s => s.removeList)
  const removeCheckedListItems = useStore(s => s.removeCheckedListItems)
  const t = useTranslation()

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
      try {
        const list = await db.getList(cardId);
        if (list) {
          const updatedItem = {
            ...list,
            content: list.content.filter((el) => !el.checked),
            updatedAt: new Date().toISOString(),
          };
          try {
            removeCheckedListItems(cardId)
            await dbActions({ action: 'update', data: updatedItem })
          } catch (error) {
            console.error('Failed to delete checked items in list:', error);
          }
        } else {
          throw new Error(`item not updated to IndexedDB, list with id: ${cardId} was not found`)
        }
      } catch (error) {
        console.warn(`item not updated to IndexedDB, list with id: ${cardId} was not found. Error: ${error}`)
        //TODO - Prompt message
      }
    }
  }

  const copyIntoDB = async (newId: string) => {
    try {
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
        throw new Error(`item not copied to IndexedDB, list with id: ${cardId} was not found`)
      }
    } catch (error) {
      console.warn(`item not copied to IndexedDB, list with id: ${cardId} was not found. Error: ${error}`)
      //TODO - Prompt message
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
    closePopover()
  }

  return (
    <Popover placementStyles={{ ...popoverPlacement() }} id={`${cardId}-menu`} >
      <ul className="text-sm font-medium">
        <li className="w-full"><button className="p-2 hover:text-secondary text-start hover:bg-menu-active focus:bg-menu-active hover:cursor-pointer w-full rounded" aria-label={t('card.menuPopover.copyCard')} onClick={(e) => handleMenuClick(e, 'copy')} autoFocus={true}>{t('card.menuPopover.copyCard')}</button></li>
        <li className="w-full"><button className="p-2 hover:text-secondary text-start hover:bg-menu-active focus:bg-menu-active hover:cursor-pointer w-full rounded" aria-label={t('card.menuPopover.removeChecked')} onClick={(e) => handleMenuClick(e, 'removeChecked')}>{t('card.menuPopover.removeChecked')}</button></li>
        <li className="w-full"><button className="p-2 text-start text-muted-graphic/70 w-full rounded" aria-label={t('card.menuPopover.addCoAuthor')} disabled>{t('card.menuPopover.addCoAuthor')}</button></li>
        <li className="w-full hover:bg-red-100  rounded"><button className="p-2 text-red-700 focus:bg-red-100  text-start hover:cursor-pointer w-full rounded flex items-center" aria-label={t('card.menuPopover.removeCard')} onClick={(e) => handleMenuClick(e, 'remove')}>{t('card.menuPopover.removeCard')} <TrashIcon className="relative top-0.5 left-1" /></button></li>
      </ul>
    </Popover>
  )
}