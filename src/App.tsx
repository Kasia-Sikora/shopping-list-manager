import { useEffect } from 'react';
import Card from './components/Card';
import { useStore } from './stores/store';
import { useLocalStorage } from 'usehooks-ts';

const App = () => {
  const { items } = useStore();
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');

  const switchTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', `theme-${theme}`);
  }, [theme]);

  return (
    <div className="text-primary">
      <label className="inline-flex items-center">
        <input type="checkbox" value="" onChange={switchTheme} checked={theme === 'light'} className="sr-only peer" />
        <div className="relative w-9 h-5 bg-primary focus:outline-none focus:ring-4 focus:ring-brand-soft dark:ring-brand-soft rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-buffer after:content-[''] after:absolute after:top-0.5 after:inset-s-0.5 after:bg-secondary after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand"></div>
      </label>

      <Card />
      <div className="grid grid-cols-3 gap-4 pt-2">
        {items?.map((item, index) => {
          return <Card key={index} editedItem={item} />;
        })}
      </div>
    </div>
  );
};

export default App;
