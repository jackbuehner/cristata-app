import { invoke } from '@tauri-apps/api/tauri';

interface OpenWindowOpts {
  customName?: string;
}

export function openWindow(url: string | URL, target: string, features?: string, opts?: OpenWindowOpts) {
  if (invoke) {
    console.log(target);
    return invoke('open_window', {
      label: target,
      title: opts?.customName || 'Cristata',
      location: url.toString(),
    });
  }
  return window.open(url, target, features);
}
