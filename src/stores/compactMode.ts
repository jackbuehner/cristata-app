import { writable } from 'svelte/store';

const persistedValueStr = localStorage?.getItem('store:compactMode');
const persistedValue = persistedValueStr === 'true' ? true : persistedValueStr === 'false' ? false : undefined;
const isTouchDevice = matchMedia('(pointer:course)').matches;

export const compactMode = writable(persistedValue ?? !isTouchDevice);

compactMode.subscribe((compactMode) => {
  localStorage?.setItem('store:compactMode', `${compactMode}`);
});
