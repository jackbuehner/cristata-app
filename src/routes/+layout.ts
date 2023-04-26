import { browser } from '$app/environment';
import { overrideItemIdKeyNameBeforeInitialisingDndZones } from 'svelte-dnd-action';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load = (async () => {
  const tauri = await import('@tauri-apps/api/app')
    .then(async ({ getTauriVersion }) => {
      return await getTauriVersion()
        .then(() => true)
        .catch(() => false);
    })
    .catch(() => false);

  if (browser && tauri) {
    const { invoke } = await import('@tauri-apps/api');

    const [build, _version]: [number, string] = await invoke('get_windows_version');
    const version = parseFloat(_version);

    return {
      tauri,
      build,
      version,
      features: {
        mica: build >= 22000,
        acrylic: build >= 17763 && build < 22000,
      },
    };
  }

  overrideItemIdKeyNameBeforeInitialisingDndZones('_id');

  return { tauri };
}) satisfies LayoutLoad;
