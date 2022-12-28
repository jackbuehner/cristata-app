import fetch2, { RequestInit2 } from './utils/fetch2';

window.global ||= window;

declare global {
  function fetch2(input: string | URL, opts?: RequestInit2): Promise<Response>;
}
window.fetch2 = fetch2;

export {};
