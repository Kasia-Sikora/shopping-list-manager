import { useEffect } from 'react';
import Card from './components/Card';
import { useStore } from './stores/store';
import { useLocalStorage } from 'usehooks-ts'

const App = () => {
  const { items } = useStore();
  const defaultDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const [theme, setTheme] = useLocalStorage('theme', defaultDark ? 'dark' : 'light');

  const switchTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  useEffect(() => {
    document.body.setAttribute('data-theme', `theme-${theme}`)
  }, [theme])


  return (
    <div className='text-primary'>
      {/* <button onClick={switchTheme}>Switch theme</button> */}

      {/* temp theme button toggle */}
      <div className="toggle-switch">
        <label className="switch-label">
          <input type="checkbox" className="checkbox" onChange={switchTheme} checked={theme === 'light'} />
          <span className="slider"></span>
        </label>
      </div>
      {/* temp theme button toggle */}

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
