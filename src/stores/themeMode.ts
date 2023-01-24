import { writable } from 'svelte/store';

const prefersDarkMode = !!window?.matchMedia('(prefers-color-scheme: dark)').matches;

export const themeMode = writable<'light' | 'dark'>(prefersDarkMode ? 'dark' : 'light');
