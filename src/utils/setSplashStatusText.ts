import { browser } from '$app/environment';

export function setSplashStatusText(str?: string) {
  if (browser) {
    const note = document.querySelector('.root-splash-note');
    if (note) note.textContent = str || '© Jack Buehner';
  }
}
