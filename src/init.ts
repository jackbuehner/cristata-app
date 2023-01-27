import { browser } from '$app/environment';
import type { RequestInit2 } from './utils/fetch2';
import fetch2 from './utils/fetch2';

if (browser) window.global ||= window;

declare global {
  function fetch2(input: string | URL, opts?: RequestInit2): Promise<Response>;
}
if (browser) window.fetch2 = fetch2;
