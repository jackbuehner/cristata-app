import { browser } from '$app/environment';
import { writable } from 'svelte/store';

const persistedValueStr = (browser && localStorage?.getItem('store:collapsedPane')) || null;
const persistedValue = persistedValueStr === 'true' ? true : persistedValueStr === 'false' ? false : undefined;

export const collapsedPane = writable(persistedValue || false);

collapsedPane.subscribe((collapsedPane) => {
  if (browser) localStorage?.setItem('store:collapsedPane', `${collapsedPane}`);
});
