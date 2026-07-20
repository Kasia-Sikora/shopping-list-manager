import { useEffect } from "react";
import { useThemeStore } from "../../stores/store";
import Moon from '../../assets/moon.svg?react'
import Sun from '../../assets/sun.svg?react'
import { useTranslation } from "../../hooks/useTranslationHook";

const ThemeToggle = () => {
  const t = useTranslation()
  const { theme, setTheme } = useThemeStore()

  const switchTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    const localStorageTheme = localStorage.getItem('theme')
    if (!localStorageTheme) {
      const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(defaultDark ? 'dark' : 'light')
    }
  }, [setTheme])

  useEffect(() => {
    document.body.setAttribute('data-theme', `theme-${theme}`);
  }, [theme]);

  const ariaLabel = theme === 'light' ? t('header.settings.theme.lightMode'): t('header.settings.theme.darkMode')

  const isThemeLight = theme === 'light'

  return (

    <label className="relative inline-flex items-center justify-between bg-theme-toggle-bg size-8 w-18 p-0.5 rounded-full transition-all duration-200" data-testid={'theme-toggle'} aria-label={ariaLabel}>
      <div className={`flex justify-between size-6 w-full px-2`}>
        <div className={`flex size-4 text-theme-toggle-text-inactive`}><Sun /></div>
        <div className={`flex size-4 text-theme-toggle-text-inactive`}><Moon /></div>
      </div>
      <input type="checkbox" value={theme} onChange={switchTheme} checked={isThemeLight} className="sr-only peer" />
      <div className={`absolute flex justify-center  cursor-pointer text-theme-toggle-text-active peer-focus:text-accent hover:text-accent bg-card transition-all duration-200 rounded-full size-7 ${isThemeLight ? 'translate-x-0' : 'translate-x-10'}`}>
        <div className={`absolute flex size-5 transition-opacity bottom-1.5 duration-200 ${isThemeLight ? 'opacity-0 w-0' : 'opacity-100'}`}><Moon /></div>
        <div className={`absolute flex size-5 transition-opacity bottom-1.5 duration-200 ${!isThemeLight ? 'opacity-0 w-0' : 'opacity-100'}`}><Sun /></div>
      </div>

    </label>
  )

}

export default ThemeToggle;