import { useEffect, useState } from 'react';
import Card from './components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { DEFAULT_VALUES, useStore, useSyncStore } from './stores/store';
import ThemeToggle from './components/atoms/ThemeToggle';
import { dbActions, sortByListOrder, sortListContent } from './utils/storeUtils';
import { appGuards, EMPTY_CARD_ID } from './consts';
import { OfflineIndicator } from './components/OfflineIndicator';
import * as db from './services/indexedDB';
import { syncEngine } from './services/syncEngine';
import { isSortable } from '@dnd-kit/react/sortable';
import { apiService } from './services/apiService';
import CartIcon from './assets/cart.svg?react'

const App = () => {
  const { lists, setLists, moveList } = useStore()
  const { isOnline } = useSyncStore()

  useEffect(() => {
    const getIndexDBLists = async () => {
      const listOrder = await db.getMetadata('listOrder');
      const indexedDbLists = await db.getLists()
      if (useSyncStore.getState().isOnline) {
        try {
          const pgDbLists = await apiService.getAllLists()
          await syncEngine.reconcileLists(indexedDbLists, pgDbLists)
        } catch (e) {
          console.error('Pull-on-init failed; falling back to local data', e)
        }
      }
      const lists = await db.getLists()
      if (listOrder?.value && Array.isArray(listOrder.value)) {
        const orderedLists = sortByListOrder(listOrder.value as string[], lists)
        setLists(orderedLists);
      } else {
        setLists(lists);
      }

      if ((!lists || !lists.length) && !appGuards.consentAskCount) {
        const consent = window.confirm('Załadować testowe dane?')
        appGuards.addConsentAskCount()
        if (consent) {
          const lists = sortListContent(DEFAULT_VALUES)
          setLists(lists)
          for (const list of lists) {
            await db.insertList(list)
            await db.addToQueue({ action: 'create', data: list });
          }
          if (useSyncStore.getState().isOnline) {
            await syncEngine.syncChanges();
          }
        }
      }
      else if (lists) {
        if (listOrder?.value && Array.isArray(listOrder.value)) {
          const orderedLists = sortByListOrder(listOrder.value as string[], lists)
          if (orderedLists?.length && orderedLists.length === lists.length) {
            setLists(sortListContent({ state: { lists: orderedLists } }))
          } else {
            throw Error('indexedDB lists differs from metadata')
          }
        } else {
          setLists(sortListContent({ state: { lists: lists } }))
        }
      }

      const schemaVersion = await db.getMetadata('schemaVersion')
      if (schemaVersion?.value !== db.SCHEMA_VERSION) {
        await db.setMetadata('schemaVersion', db.SCHEMA_VERSION)
      }
    }
    if (!appGuards.mount) {
      getIndexDBLists()
      appGuards.addMount()
    }
  }, [setLists])

  const [active, setActive] = useState<boolean>(false)
  const { ref } = useDroppable({ id: 'board' })

  return (
    <div className={`text-primary placeholder:text-primary/50 ${!isOnline ? 'pt-5' : ''}`}>
      <header className='flex justify-between items-center'>
        <h1 className='flex gap-2 text-3xl font-bold text-accent items-center'><CartIcon className='size-14'/>Listy zakupów</h1>
        <div className='flex justify-end gap-3 transition-all duration-300'>
          <OfflineIndicator />
          <ThemeToggle />
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
          <div ref={ref} className={`${active ? 'bg-active/50 outline-2 outline-active outline-dashed' : ''} bg-board p-7 rounded-2xl w-full columns-1 sm:columns-2 lg:columns-5 my-10 gap-4`}>
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
