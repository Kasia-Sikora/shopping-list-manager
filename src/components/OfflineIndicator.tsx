import { useNetworkStatus } from "../hooks/useNetworkStatus"
import { setMetadata } from "../services/indexedDB"
import { useCallback, useEffect, type ReactElement } from "react"
import { useSyncStore } from "../stores/store"
import { syncEngine } from "../services/syncEngine"
import { SYNC_DELAY } from "../consts"
import OfflineIcon from '../assets/offline.svg?react'
import SyncingIcon from '../assets/syncing.svg?react';
import SyncedIcon from '../assets/synced.svg?react';
import PendingIcon from '../assets/pending.svg?react'
import FailedIcon from '../assets/failed.svg?react'

type SyncState = 'failed' | 'pending' | 'syncing' | 'synced'

type StatusIndicator = {
  status: SyncState,
  message: string,
  statusIcon: ReactElement
}

type OfflineIndicator = {
  loading: boolean
}

const PILL_STYLE: Record<SyncState, { background: string; color: string }> = {
  synced: { background: 'var(--sync-synced-bg)', color: 'var(--sync-synced-fg)' },
  syncing: { background: 'var(--sync-syncing-bg)', color: 'var(--sync-syncing-fg)' },
  pending: { background: 'var(--sync-pending-bg)', color: 'var(--sync-pending-fg)' },
  failed: { background: 'var(--sync-failed-bg)', color: 'var(--sync-failed-fg)' },
}

export const OfflineIndicator = ({loading}: OfflineIndicator) => {
  const { isOnline } = useNetworkStatus()
  const { syncStatus, pendingChangesCount, setIsOnline } = useSyncStore()

  const getStatus = useCallback((): StatusIndicator => {
    switch (syncStatus) {
      case 'failed':
        return { status: "failed", message: "Błąd synchronizacji", statusIcon: <FailedIcon /> }
      case 'pending':
        return { status: "pending", message: `${pendingChangesCount} w kolejce`, statusIcon: <PendingIcon /> }
      case 'syncing':
        return { status: "syncing", message: "Synchronizuję...", statusIcon: <SyncingIcon className="animate-spin" /> }
      default:
        return { status: 'synced', message: "Zapisano", statusIcon: <SyncedIcon /> }
    }
  }, [pendingChangesCount, syncStatus])

  useEffect(() => {
    const setData = async () => {
      if (isOnline) {
        syncEngine.syncChanges()
      }
      await setMetadata('isOnline', isOnline)
      setIsOnline(isOnline)
    }
    setData()
  }, [isOnline, setIsOnline])

  useEffect(() => {
    if (!isOnline) return;

    const retryInterval = setInterval(() => {
      syncEngine.syncChanges();
    }, SYNC_DELAY);

    return () => clearInterval(retryInterval);
  }, [isOnline]);

  if (!isOnline) {
    return (
      <div
        role="status"
        className="fixed top-0 left-0 z-10 flex w-full items-center justify-center gap-2 px-3 py-1 text-sm"
        style={{ background: 'var(--sync-pending-bg)', color: 'var(--sync-pending-fg)' }}
      >
        <OfflineIcon />  Working Offline - Changes will sync when back online
      </div>
    )
  }

  const status = getStatus()

  return loading ?
    <div className="w-23 h-8 bg-loading-items rounded-full animate-pulse" />
    : <div
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold border border-border"
      style={PILL_STYLE[status.status]}
    >
      {status.statusIcon}
      {status.message}
    </div>

}
