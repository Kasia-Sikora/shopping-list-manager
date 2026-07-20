import { useEffect, type ReactNode } from "react"
import { usePopoverIdStore } from "../../stores/store";

type Popover = {
  placementStyles: object,
  children: ReactNode
  id: string;
}

const Popover = ({ placementStyles, children, id }: Popover) => {
  const isOpen = usePopoverIdStore(s => s.openPopoverId === id)
  const closePopover = usePopoverIdStore(s => s.closePopover)

  useEffect(() => {
    if (!isOpen) return

    const handleClose = (e: MouseEvent | KeyboardEvent) => {
      const popover = document.querySelector(`[id='${id}']`)
      const button = document.querySelector(`[aria-controls='${id}']`) as HTMLButtonElement
      const isKeyboardEvent = e instanceof KeyboardEvent 
      if (isKeyboardEvent && e.key === 'Escape') {
        closePopover()
        button?.focus()
      } else if (!popover?.contains(e.target as Node) && !button?.contains(e.target as Node)) {
        closePopover()
      }
    }

    document.addEventListener('click', handleClose)
    document.addEventListener('keydown', handleClose)
    return () => {
      document.removeEventListener('click', handleClose);
      document.removeEventListener('keydown', handleClose)
    }
  }, [closePopover, id, isOpen])

  return (
    <div id={id} data-testid={id} className={`z-10 ${!isOpen ? 'hidden' : ''} bg-menu-bg border border-border rounded-lg p-2 text-primary`} style={placementStyles}>
      {children}
    </div>)
}

export default Popover