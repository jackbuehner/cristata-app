/// <reference types="vite/client" />
/// <reference types="@emotion/react/types/css-prop" />
/// <reference types="vite-plugin-pwa/client" />
/// <reference types="vite-plugin-pwa/info" />

declare module '~build/meta' {
  export const message: string;
}

declare module '~build/time' {
  const now: Date;
  export default now;
}
