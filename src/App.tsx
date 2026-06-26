import { useEffect, useState } from 'react';
import Card from './components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { DEFAULT_VALUES, useStore } from './stores/store';
import ThemeToggle from './components/atoms/ThemeToggle';
import { sortListContent } from './utils/utils';
import { EMPTY_CARD_ID, LOCAL_STORAGE_STORE_KEY } from './consts';

let consentAskCount = 0
const App = () => {
  const { lists, setLists } = useStore()

  useEffect(() => {
    const getItem = localStorage.getItem(LOCAL_STORAGE_STORE_KEY)
    const localStorageItems = getItem ? JSON.parse(getItem) : null
    if (!localStorageItems && !consentAskCount) {
      const consent = window.confirm('Załadować testowe dane?')
      consentAskCount++;
      if (consent) {
        setLists(sortListContent(DEFAULT_VALUES))
      }
    }
    else if (localStorageItems) {
      setLists(sortListContent(localStorageItems))
    }
  }, [setLists])

  const [active, setActive] = useState<boolean>(false)
  const { ref } = useDroppable({ id: 'board' })

  return (
    <div className='text-primary placeholder:text-primary'>
      <header>
        <h1 className="sr-only">Shopping List Manager</h1>

        <ThemeToggle />
      </header>
      <main>
        <Card emptyCardId={EMPTY_CARD_ID} />
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
            {lists?.map((list, index) => {
              return <Card key={`${list.id}-${index}`} index={index} editedList={list} styles={'mb-4 break-inside-avoid'} />;
            })}
          </div>
        </DragDropProvider>
      </main>
    </div>
  );
};

export default App;
