import { useTheme } from '@emotion/react';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { useRegisterSW } from 'virtual:pwa-register/react';

function ReloadPrompt() {
  const theme = useTheme();

  // replaced dynamically
  const buildDate = '__DATE__';
  // replaced dyanmicaly
  const reloadSW = '__RELOAD_SW__';

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      console.log(`[Service Worker] Registering service Worker from ${buildDate} at: ${swUrl}`);
      // @ts-expect-error just ignore
      if (reloadSW === 'true') {
        r &&
          setInterval(() => {
            console.log('[Service Worker] Checking for sw update');
            r.update();
          }, 60000 /* check every minute */);
      } else {
        console.log('[Service Worker] Successfully registered: ', r);
      }
    },
    onRegisterError(error) {
      console.log('[Service Worker] Registration error:', error);
    },
  });

  useEffect(() => {
    if (offlineReady) {
      toast.info(
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600, fontFamily: theme.font.headline }}>Ready to work offline.</div>
          <div style={{ fontSize: 13 }}>
            Some parts of Cristata will work in read-only mode without an internet connection.
          </div>
        </div>,
        {
          onClose: () => setOfflineReady(false),
          updateId: 'pwa-offline-ready',
        }
      );
    }
  }, [offlineReady]);

  useEffect(() => {
    if (needRefresh) {
      toast.info(
        <div style={{ padding: '8px 0' }}>
          <div style={{ fontWeight: 600, fontFamily: theme.font.headline }}>An update is a available.</div>
          <div style={{ fontSize: 13 }}>
            Some features may not work unless you update. Click this notification to update.
          </div>
        </div>,
        {
          autoClose: false,
          closeOnClick: false,
          onClick: () => updateServiceWorker(true),
          updateId: 'pwa-update-ready',
          closeButton: <></>,
        }
      );
    }
  }, [needRefresh]);

  return null;
}

export { ReloadPrompt };
