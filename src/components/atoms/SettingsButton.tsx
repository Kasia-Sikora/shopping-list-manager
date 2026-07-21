import { useTranslation } from "../../hooks/useTranslationHook";
import SettingsIcon from '../../assets/settings.svg?react'
import Popover from "./Popover";
import ThemeToggle from "./ThemeToggle";
import LanguageSwitcher from "./LanguageSwitcher";
import { usePopoverIdStore } from "../../stores/store";

const SettingsButton = () => {
  const t = useTranslation()
  const setOpenPopoverId = usePopoverIdStore(s => s.setOpenPopoverId)
  const isOpen = usePopoverIdStore((s) => s.openPopoverId === 'settings')
  const placement = { position: 'absolute', top: '36px', right: '0', padding: '16px', width: '250px' }

  return (
    <div className='relative flex'>
      <button aria-controls='settings' aria-expanded={isOpen} className="cursor-pointer text-muted hover:text-accent focus:text-accent" aria-label={t('header.settings.label')} onClick={() => setOpenPopoverId(!isOpen ? "settings" : null)}><SettingsIcon /></button>
      <Popover placementStyles={placement} id="settings">
        <div className='flex flex-col gap-4 transition-all duration-200 text-primary'>
          <h4 className="flex gap-2 font-semibold border-b border-primary/20 pb-3">{t('header.settings.label')}</h4>
          <div className="flex justify-between items-center"><p>{t('header.settings.theme.label')}</p><ThemeToggle /></div>
          <div className="flex justify-between items-center"><p>{t('header.settings.lang.label')}</p><LanguageSwitcher /></div>
        </div>
      </Popover>
    </div>
  )
}

export default SettingsButton;