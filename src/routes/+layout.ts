import { browser } from '$app/environment';
import { getTauriVersion } from '@tauri-apps/api/app';
import type { LayoutLoad } from './$types';

export const ssr = false;

export const load = (async () => {
  const tauri = getTauriVersion
    ? await getTauriVersion()
        .then(() => true)
        .catch(() => false)
    : false;

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

  return { tauri };
}) satisfies LayoutLoad;
