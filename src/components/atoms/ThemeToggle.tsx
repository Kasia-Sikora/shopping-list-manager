import { useEffect } from "react";
import { useThemeStore } from "../../stores/store";

const ThemeToggle = () => {
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
  
  return (
    <label className="inline-flex items-center" data-testid={'theme-toggle'}>
      <input type="checkbox" value={theme} onChange={switchTheme} checked={theme === 'light'} className="sr-only peer" />
      <div className="relative w-9 h-5 bg-primary focus:outline-none focus:ring-4 focus:ring-brand-soft dark:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-secondary after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
    </label>
  )
}

export default ThemeToggle;