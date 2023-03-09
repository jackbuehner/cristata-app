import { slugify } from '@jackbuehner/cristata-utils';
import { app, invoke } from '@tauri-apps/api';

interface OpenWindowOpts {
  customName?: string;
  width?: number;
  height?: number;
}

export function openWindow(url: string | URL, target: string, features?: string, opts?: OpenWindowOpts) {
  const isTauriApp = app
    .getVersion()
    .then(() => true)
    .catch(() => false);

  return isTauriApp.then((isTauriApp) => {
    if (isTauriApp && invoke) {
      return invoke('open_window', {
        label: slugify(target, '-'),
        title: opts?.customName || 'Cristata',
        location: url.toString(),
        width: opts?.width,
        height: opts?.height,
      });
    }
    return window.open(url, target, features);
  });
}
