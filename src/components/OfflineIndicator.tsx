import { useNetworkStatus } from "../hooks/useNetworkStatus"
import { getSyncQueue } from "../services/indexedDB"
import error from '../assets/error.svg'
import { useEffect, useState } from "react"
import type { SyncStatus } from "../services/interfaces"

type StatusIndicator = {
  status: 'failed' | 'pending' | 'syncing' | 'synced',
  color: string,
  message: string
}

export const OfflineIndicator = () => {
  const { isOnline } = useNetworkStatus()
  const [status, setStatus] = useState<StatusIndicator | null>(null)

  const getStatus = async (): Promise<StatusIndicator> => {
    try {
      const statusArr = await getSyncQueue()
      if (statusArr.some(item => item.status === 'failed')) {
        return { status: "failed", color: 'bg-red-600', message: "Sync Failed" }
      } else if (statusArr.some(item => item.status === 'pending')) {
        const count = statusArr.filter(item => item.status === 'pending').length
        return { status: "pending", color: 'bg-slate-500', message: `${count} pending changes` }
      } else if (statusArr.some(item => item.status === 'syncing')) {
        return { status: "syncing", color: 'bg-amber-600', message: "Syncing..." }
      } else {
        return { status: 'synced', color: 'bg-lime-600', message: "Synced" }
      }
    } catch (error) {
      // IndexedDB not available (test environment)
      console.debug('IndexedDB unavailable:', error);
      return { status: 'synced', color: 'bg-lime-600', message: "Synced" };
    }
  }

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      if (mounted) {
        const data = await getStatus();
        setStatus(data);
      }
    }
    fetchStatus()

    return () => {
      mounted = false;
    };
  }, []);

  const getShadow = (status: SyncStatus) => {
    if (!status) return;

    switch (status) {
      case 'failed':
        return `0 0 2px rgb(255,255,255),
            0 0 2px 2px rgb(227,165,168),
            0 0 10px 5px rgb(231,0,11)`;
      case 'pending':
        return `0 0 2px rgb(255,255,255),
            0 0 2px 2px rgb(170,176,188),
            0 0 10px 5px rgb(106,114,130)`;
      case 'syncing':
        return `0 0 2px rgb(255,255,255),
            0 0 2px 2px rgb(247,173,141),
            0 0 10px 5px rgb(245,73,0)`;
      case 'synced':
        return `0 0 2px rgb(255,255,255),
            0 0 2px 2px rgb(165,228,82),
            0 0 10px 5px rgb(94,165,0)`
    }
  }

  const bulbStyle = {
    boxShadow: status ? getShadow(status.status) : 'none'
  }

  return isOnline ?
    <div>
      {status ?
        <div className="flex gap-2 items-center">
          <p className="text-xs text-gray-600">{status.message}</p>
          <div className={`w-4 h-4 rounded-full ${status.color}`} style={bulbStyle} />
        </div>
        : null
      }
    </div>
    : (
      <div className="fixed top-0 left-0 flex gap-2 bg-red-900/70 w-full px-3 py-1 text-sm italic justify-center z-10"><img src={error} role="presentation" height={16} width={16} /> Working Offline - Changes will sync when back online</div>
    )
}