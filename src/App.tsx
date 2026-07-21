import { useEffect, useState } from 'react';
import Card from './components/Card';
import { DragDropProvider, useDroppable } from '@dnd-kit/react';
import { isLocale, useLocaleStore, useStore, useSyncStore } from './stores/store';
import type { List } from './interfaces';
import { dbActions, rebuildListOrder, sortByListOrder, sortListContent } from './utils/storeUtils';
import { appGuards, EMPTY_CARD_ID } from './consts';
import { OfflineIndicator } from './components/OfflineIndicator';
import * as db from './services/indexedDB';
import { syncEngine } from './services/syncEngine';
import { isSortable } from '@dnd-kit/react/sortable';
import { apiService } from './services/apiService';
import CartIcon from './assets/cart.svg?react'
import LoadingBoard from './components/LoadingBoard';
import EmptyBoard from './components/EmptyBoard';
import { SpeedInsights } from "@vercel/speed-insights/react"
import { Analytics } from '@vercel/analytics/react';
import { useTranslation } from './hooks/useTranslationHook';
import SettingsButton from './components/atoms/SettingsButton';

const App = () => {
  const { lists, setLists, moveList } = useStore()
  const { isOnline } = useSyncStore()
  const { lang, setLang } = useLocaleStore()
  const [isReady, setIsReady] = useState(false);
  const t = useTranslation()

  useEffect(() => {
    if (!lang) {
      const locale = navigator.language.split("-")[0] ?? "en"
      if (isLocale(locale)) {
        setLang(locale)
        if (!document.documentElement.lang.includes(locale)) {
          document.documentElement.setAttribute('lang', locale);
        }
      } else {
        setLang('en')
      }
    } else if (!document.documentElement.lang.includes(lang)) {
      document.documentElement.setAttribute('lang', lang);
    }
  }, [lang, setLang])

  useEffect(() => {
    const getIndexDBLists = async () => {
      try {
        const listOrder = await db.getMetadata('listOrder')
        let currentIndexDBLists = await db.getLists()

        if (useSyncStore.getState().isOnline) {
          try {
            const pgDbLists = await apiService.getAllLists()
            await syncEngine.reconcileLists(currentIndexDBLists, pgDbLists)
            currentIndexDBLists = await db.getLists()
          } catch (e) {
            console.error('Pull-on-init failed; falling back to local data', e)
          }
        }

        const schemaVersion = await db.getMetadata('schemaVersion')
        if (schemaVersion?.value !== db.SCHEMA_VERSION) {
          await db.setMetadata('schemaVersion', db.SCHEMA_VERSION)
        }

        let resolvedLists: List[]
        if (listOrder?.value && Array.isArray(listOrder.value)) {
          const orderedLists = sortByListOrder(listOrder.value as string[], currentIndexDBLists)

          if (orderedLists.length === currentIndexDBLists.length) {
            resolvedLists = sortListContent({ state: { lists: orderedLists } })
          } else {
            console.error('indexedDB lists differ from metadata; rebuilding list order')
            const newListOrder = rebuildListOrder(listOrder.value, currentIndexDBLists)
            await db.setMetadata('listOrder', newListOrder)
            resolvedLists = sortListContent({
              state: { lists: sortByListOrder(newListOrder, currentIndexDBLists) },
            })
          }
        } else {
          resolvedLists = sortListContent({ state: { lists: currentIndexDBLists } })
        }

        setLists(resolvedLists)
      } catch (e) {
        console.error('App initialization failed', e)
      } finally {
        setIsReady(true)
      }
    }
    if (!appGuards.mount) {
      getIndexDBLists()
      appGuards.addMount()
    }
  }, [setLists])

  const [active, setActive] = useState<boolean>(false)
  const { ref } = useDroppable({ id: 'board' })

  const persistListOrder = async (toIndex: number) => {
    // Update order in metadata
    const { lists: updatedLists } = useStore.getState();
    const listIds = updatedLists.map(l => l.id);
    await db.setMetadata('listOrder', listIds);

    // Update the moved list's timestamp
    const movedList = updatedLists[toIndex];
    const updated = { ...movedList, updatedAt: new Date().toISOString() };
    await dbActions({ action: 'update', data: updated });
  }

  const renderBoard = () => {
    return !lists.length ? <EmptyBoard /> :
      <DragDropProvider
        onDragEnd={(event) => {
          if (event.canceled) return;

          const { source, target } = event.operation;
          if (!source || !target) return;
          if (isSortable(source) && isSortable(target)) {
            const fromIndex = source.initialIndex;
            const toIndex = source.index;

            moveList(fromIndex, toIndex);
            persistListOrder(toIndex).catch(console.error)
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
        <div ref={ref} className={`${active ? 'bg-active/50 outline-2 outline-active outline-dashed' : ''} bg-board p-3 lg:p-7 rounded-2xl w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xxl:grid-cols-5
auto-rows-[8px] gap-x-4 gap-y-0 items-start my-5 lg:my-10 gap-4`}>
          {lists?.map((list, index) => {
            return <Card key={`${list.id}`} index={index} editedList={list} />;
          })}
        </div>
      </DragDropProvider>
  }

  return (
    <div className={`font-display text-primary p-2 lg:p-5 placeholder:text-primary/50 ${!isOnline ? 'mt-4' : ''}`}>
      <Analytics />
      <SpeedInsights />
      <header className='flex justify-between items-center w-full mb-5 lg:mb-10'>
        <h1 className='flex flex-nowrap gap-2 text-xl lg:text-3xl font-bold text-accent items-center'><CartIcon className='size-9' /><span className='block invisible w-0 sm:visible sm:w-auto'>{t('header.title')}</span></h1>
        <div className='flex justify-end gap-3 transition-all duration-300 '>
          <OfflineIndicator loading={!isReady} />
          <SettingsButton />
        </div>
      </header>
      <main>
        <Card emptyCardId={EMPTY_CARD_ID} />
        {!isReady ? <LoadingBoard /> : renderBoard()}
      </main>
    </div>
  );
};

export default App;
