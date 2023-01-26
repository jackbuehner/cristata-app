import { writable } from 'svelte/store';

export const compactMode = writable(localStorage?.getItem('compactModeStore') === 'true' || false);

compactMode.subscribe((compactMode) => {
  localStorage?.setItem('compactModeStore', `${compactMode}`);
});
