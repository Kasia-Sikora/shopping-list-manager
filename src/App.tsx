import { useEffect, useState } from 'react';
import Card from './components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { DEFAULT_VALUES, useStore } from './stores/store';
import ThemeToggle from './components/atoms/ThemeToggle';

let consentAskCount = 0
const App = () => {
  const { items, setItems } = useStore()

  useEffect(() => {
    const localStorageItems = localStorage.getItem('shopping-lists')
    if (!localStorageItems && !consentAskCount) {
      const consent = window.confirm('Załadować testowe dane?')
      consentAskCount++;
      if (consent) {
        setItems(DEFAULT_VALUES)
      }
    }
  }, [setItems])

  const [active, setActive] = useState<boolean>(false)
  const { ref } = useDroppable({ id: 'board' })

  return (
    <div className='text-primary placeholder:text-primary'>
      <ThemeToggle />

      <Card />
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;

          if (active) {
            setActive(false)
          }
        }}
        onDragStart={() => {
          if (!active) {
            setActive(true);
          }
        }}
      >
        <div ref={ref} className={`${active ? 'bg-active/50 outline-2 outline-active outline-dashed' : ''}  rounded-sm w-full columns-1 sm:columns-2 lg:columns-4 my-10 gap-4`}>
          {items?.map((item, index) => {
            return <Card key={index} index={index} editedItem={item} styles={'mb-4 break-inside-avoid'} />;
          })}
        </div>
      </DragDropProvider>
    </div>
  );
};

export default App;
