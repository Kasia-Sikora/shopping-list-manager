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

  const ariaLabel = theme === 'light'? t('header.darkMode'): t('header.lightMode')
  return (
    <label className="inline-flex items-center" data-testid={'theme-toggle'} aria-label={ariaLabel}>
      <input type="checkbox" value={theme} onChange={switchTheme} checked={theme === 'light'} className="sr-only peer" />
      <div className="cursor-pointer text-accent">
        {theme === 'light' ? <Moon /> : <Sun />}
      </div>
    </label>
  )
}

export default ThemeToggle;