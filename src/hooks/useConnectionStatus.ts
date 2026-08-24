import { useEffect } from 'react';
import { useNetworkStatus } from './useNetworkStatus';
import { apiService } from '../services/apiService';
import { useSyncStore } from '../stores/store';
import { HEALTH_POLL_DELAY } from '../consts';

export function useConnectionStatus() {
  const { isOnline } = useNetworkStatus();
  const { connectionStatus, setConnectionStatus, setIsOnline } = useSyncStore();

  useEffect(() => {
    if (isOnline) {
      setIsOnline(true);
    } else {
      setIsOnline(false);
      setConnectionStatus('offline');
    }
  }, [isOnline, setConnectionStatus, setIsOnline]);

  useEffect(() => {
    if (connectionStatus === 'server-unreachable' && useSyncStore.getState().isOnline) {
      const checkHealthInterval = setInterval(async () => {
        const isServerAvailable = await apiService.health();
        if (isServerAvailable) {
          setConnectionStatus('online');
        }
      }, HEALTH_POLL_DELAY);

      return () => clearInterval(checkHealthInterval);
    }
  }, [connectionStatus, setConnectionStatus]);

  return { connectionStatus };
}
