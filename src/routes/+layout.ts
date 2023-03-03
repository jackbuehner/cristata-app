import { getTauriVersion } from '@tauri-apps/api/app';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load = (async () => {
  const tauri = getTauriVersion ? await getTauriVersion().then(() => true).catch(() => false) : false;

  return { tauri };
}) satisfies LayoutLoad;