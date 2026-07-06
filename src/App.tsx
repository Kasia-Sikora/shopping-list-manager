import { useEffect, useState } from 'react';
import Card from './components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { DEFAULT_VALUES, useStore, useSyncStore } from './stores/store';
import ThemeToggle from './components/atoms/ThemeToggle';
import { dbActions, sortByListOrder, sortListContent } from './utils/storeUtils';
import { EMPTY_CARD_ID, LOCAL_STORAGE_STORE_KEY } from './consts';
import { OfflineIndicator } from './components/OfflineIndicator';
import * as db from './services/indexedDB';
import { syncEngine } from './services/syncEngine';
import { isSortable } from '@dnd-kit/react/sortable';

let consentAskCount = 0
let mount = 0
const testing = true
const App = () => {
  const { lists, setLists, moveList } = useStore()

  useEffect(() => {
    //For Tests: 
    if (testing) {
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
    } else {
      const getIndexDBLists = async () => {
        const listOrder = await db.getMetadata('listOrder');
        const dbLists = await db.getLists()
        if (listOrder?.value && Array.isArray(listOrder.value)) {
          const orderedLists = sortByListOrder(listOrder.value as string[], dbLists)
          setLists(orderedLists);
        } else {
          setLists(dbLists);
        }

        if ((!dbLists || !dbLists.length) && !consentAskCount) {
          const consent = window.confirm('Załadować testowe dane?')
          consentAskCount++;
          if (consent) {
            const lists = sortListContent(DEFAULT_VALUES)
            setLists(lists)
            for (const list of lists) {
              await db.upsertList(list)
              await db.addToQueue({ action: 'create', data: list });
            }
            if (useSyncStore.getState().isOnline) {
              await syncEngine.syncChanges();
            }
          }
        }
        else if (dbLists) {
          if (listOrder?.value && Array.isArray(listOrder.value)) {
            // Sort lists by the stored order
            const orderedLists = sortByListOrder(listOrder.value as string[], dbLists)
            if (orderedLists?.length && orderedLists.length === dbLists.length) {
              setLists(sortListContent({ state: { lists: orderedLists } }))
            } else {
              throw Error('indexedDB lists differs from metadata')
            }
          } else {
            setLists(sortListContent({ state: { lists: dbLists } }))
          }
        }

        const schemaVersion = await db.getMetadata('schemaVersion')
        if (schemaVersion?.value !== db.SCHEMA_VERSION) {
          await db.setMetadata('schemaVersion', db.SCHEMA_VERSION)
        }
      }
      if (!mount) {
        getIndexDBLists()
        mount += 1
      }
    }
  }, [setLists])

  const [active, setActive] = useState<boolean>(false)
  const { ref } = useDroppable({ id: 'board' })

  return (
    <div className='text-primary placeholder:text-primary'>
      <header>
        <h1 className="sr-only">Shopping List Manager</h1>
        <div className='flex justify-between'>
          <ThemeToggle />
          <OfflineIndicator />
        </div>
      </header>
      <main>
        <Card emptyCardId={EMPTY_CARD_ID} />
        <DragDropProvider
          onDragEnd={async (event) => {
            if (event.canceled) return;

            const { source, target } = event.operation;
            if (!source || !target) return;
            if (isSortable(source) && isSortable(target)) {
              const fromIndex = source.initialIndex;
              const toIndex = source.index;

              moveList(fromIndex, toIndex);

              // Update order in metadata
              const { lists: updatedLists } = useStore.getState();
              const listIds = updatedLists.map(l => l.id);
              await db.setMetadata('listOrder', listIds);

              // Update the moved list's timestamp
              const movedList = updatedLists[toIndex];
              const updated = { ...movedList, updatedAt: new Date().toISOString() };
              await dbActions({ action: 'update', data: updated });
            }

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
