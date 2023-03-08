import { sentryVitePlugin } from '@sentry/vite-plugin';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import codegen from 'vite-plugin-graphql-codegen';
import BuildInfo from 'vite-plugin-info';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgrPlugin from 'vite-plugin-svgr';
import viteTsconfigPaths from 'vite-tsconfig-paths';

process.env.VITE_BUILD_START_DATE_TIME = new Date().toISOString();

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxImportSource: '@emotion/react',
      babel: {
        plugins: ['@emotion/babel-plugin'],
      },
      fastRefresh: false,
    }),
    viteTsconfigPaths(),
    svgrPlugin(),
    nodePolyfills({ protocolImports: true }),
    BuildInfo(),
    sveltekit(),
    SvelteKitPWA({
      devOptions: { enabled: false },
      registerType: 'prompt',
      manifest: {
        name: 'Cristata',
        short_name: 'Cristata',
        description: 'Content manager and planner for school newspapers',
        icons: [
          {
            src: 'icons/71x71-icon.png',
            type: 'image/png',
            sizes: '71x71',
            purpose: 'any',
          },
          {
            src: 'icons/89x89-icon.png',
            type: 'image/png',
            sizes: '89x89',
            purpose: 'any',
          },
          {
            src: 'icons/107x107-icon.png',
            type: 'image/png',
            sizes: '107x107',
            purpose: 'any',
          },
          {
            src: 'icons/142x142-icon.png',
            type: 'image/png',
            sizes: '142x142',
            purpose: 'any',
          },
          {
            src: 'icons/284x284-icon.png',
            type: 'image/png',
            sizes: '284x284',
            purpose: 'any',
          },
          {
            src: 'icons/150x150-icon.png',
            type: 'image/png',
            sizes: '150x150',
            purpose: 'any',
          },
          {
            src: 'icons/188x188-icon.png',
            type: 'image/png',
            sizes: '188x188',
            purpose: 'any',
          },
          {
            src: 'icons/225x225-icon.png',
            type: 'image/png',
            sizes: '225x225',
            purpose: 'any',
          },
          {
            src: 'icons/300x300-icon.png',
            type: 'image/png',
            sizes: '300x300',
            purpose: 'any',
          },
          {
            src: 'icons/600x600-icon.png',
            type: 'image/png',
            sizes: '600x600',
            purpose: 'any',
          },
          {
            src: 'icons/310x150-icon.png',
            type: 'image/png',
            sizes: '310x150',
            purpose: 'any',
          },
          {
            src: 'icons/388x188-icon.png',
            type: 'image/png',
            sizes: '388x188',
            purpose: 'any',
          },
          {
            src: 'icons/465x225-icon.png',
            type: 'image/png',
            sizes: '465x225',
            purpose: 'any',
          },
          {
            src: 'icons/620x300-icon.png',
            type: 'image/png',
            sizes: '620x300',
            purpose: 'any',
          },
          {
            src: 'icons/1240x600-icon.png',
            type: 'image/png',
            sizes: '1240x600',
            purpose: 'any',
          },
          {
            src: 'icons/310x310-icon.png',
            type: 'image/png',
            sizes: '310x310',
            purpose: 'any',
          },
          {
            src: 'icons/388x388-icon.png',
            type: 'image/png',
            sizes: '388x388',
            purpose: 'any',
          },
          {
            src: 'icons/465x465-icon.png',
            type: 'image/png',
            sizes: '465x465',
            purpose: 'any',
          },
          {
            src: 'icons/620x620-icon.png',
            type: 'image/png',
            sizes: '620x620',
            purpose: 'any',
          },
          {
            src: 'icons/1240x1240-icon.png',
            type: 'image/png',
            sizes: '1240x1240',
            purpose: 'any',
          },
          {
            src: 'icons/44x44-icon.png',
            type: 'image/png',
            sizes: '44x44',
            purpose: 'any',
          },
          {
            src: 'icons/55x55-icon.png',
            type: 'image/png',
            sizes: '55x55',
            purpose: 'any',
          },
          {
            src: 'icons/66x66-icon.png',
            type: 'image/png',
            sizes: '66x66',
            purpose: 'any',
          },
          {
            src: 'icons/88x88-icon.png',
            type: 'image/png',
            sizes: '88x88',
            purpose: 'any',
          },
          {
            src: 'icons/176x176-icon.png',
            type: 'image/png',
            sizes: '176x176',
            purpose: 'any',
          },
          {
            src: 'icons/50x50-icon.png',
            type: 'image/png',
            sizes: '50x50',
            purpose: 'any',
          },
          {
            src: 'icons/63x63-icon.png',
            type: 'image/png',
            sizes: '63x63',
            purpose: 'any',
          },
          {
            src: 'icons/75x75-icon.png',
            type: 'image/png',
            sizes: '75x75',
            purpose: 'any',
          },
          {
            src: 'icons/100x100-icon.png',
            type: 'image/png',
            sizes: '100x100',
            purpose: 'any',
          },
          {
            src: 'icons/200x200-icon.png',
            type: 'image/png',
            sizes: '200x200',
            purpose: 'any',
          },
          {
            src: 'icons/620x300-icon.png',
            type: 'image/png',
            sizes: '620x300',
            purpose: 'any',
          },
          {
            src: 'icons/775x375-icon.png',
            type: 'image/png',
            sizes: '775x375',
            purpose: 'any',
          },
          {
            src: 'icons/930x450-icon.png',
            type: 'image/png',
            sizes: '930x450',
            purpose: 'any',
          },
          {
            src: 'icons/1240x600-icon.png',
            type: 'image/png',
            sizes: '1240x600',
            purpose: 'any',
          },
          {
            src: 'icons/2480x1200-icon.png',
            type: 'image/png',
            sizes: '2480x1200',
            purpose: 'any',
          },
          {
            src: 'icons/16x16-icon.png',
            type: 'image/png',
            sizes: '16x16',
            purpose: 'any',
          },
          {
            src: 'icons/20x20-icon.png',
            type: 'image/png',
            sizes: '20x20',
            purpose: 'any',
          },
          {
            src: 'icons/24x24-icon.png',
            type: 'image/png',
            sizes: '24x24',
            purpose: 'any',
          },
          {
            src: 'icons/30x30-icon.png',
            type: 'image/png',
            sizes: '30x30',
            purpose: 'any',
          },
          {
            src: 'icons/32x32-icon.png',
            type: 'image/png',
            sizes: '32x32',
            purpose: 'any',
          },
          {
            src: 'icons/36x36-icon.png',
            type: 'image/png',
            sizes: '36x36',
            purpose: 'any',
          },
          {
            src: 'icons/40x40-icon.png',
            type: 'image/png',
            sizes: '40x40',
            purpose: 'any',
          },
          {
            src: 'icons/44x44-icon.png',
            type: 'image/png',
            sizes: '44x44',
            purpose: 'any',
          },
          {
            src: 'icons/48x48-icon.png',
            type: 'image/png',
            sizes: '48x48',
            purpose: 'any',
          },
          {
            src: 'icons/60x60-icon.png',
            type: 'image/png',
            sizes: '60x60',
            purpose: 'any',
          },
          {
            src: 'icons/64x64-icon.png',
            type: 'image/png',
            sizes: '64x64',
            purpose: 'any',
          },
          {
            src: 'icons/72x72-icon.png',
            type: 'image/png',
            sizes: '72x72',
            purpose: 'any',
          },
          {
            src: 'icons/80x80-icon.png',
            type: 'image/png',
            sizes: '80x80',
            purpose: 'any',
          },
          {
            src: 'icons/96x96-icon.png',
            type: 'image/png',
            sizes: '96x96',
            purpose: 'any',
          },
          {
            src: 'icons/256x256-icon.png',
            type: 'image/png',
            sizes: '256x256',
            purpose: 'any',
          },
          {
            src: 'icons/16x16-icon.png',
            type: 'image/png',
            sizes: '16x16',
            purpose: 'any',
          },
          {
            src: 'icons/20x20-icon.png',
            type: 'image/png',
            sizes: '20x20',
            purpose: 'any',
          },
          {
            src: 'icons/24x24-icon.png',
            type: 'image/png',
            sizes: '24x24',
            purpose: 'any',
          },
          {
            src: 'icons/30x30-icon.png',
            type: 'image/png',
            sizes: '30x30',
            purpose: 'any',
          },
          {
            src: 'icons/32x32-icon.png',
            type: 'image/png',
            sizes: '32x32',
            purpose: 'any',
          },
          {
            src: 'icons/36x36-icon.png',
            type: 'image/png',
            sizes: '36x36',
            purpose: 'any',
          },
          {
            src: 'icons/40x40-icon.png',
            type: 'image/png',
            sizes: '40x40',
            purpose: 'any',
          },
          {
            src: 'icons/44x44-icon.png',
            type: 'image/png',
            sizes: '44x44',
            purpose: 'any',
          },
          {
            src: 'icons/48x48-icon.png',
            type: 'image/png',
            sizes: '48x48',
            purpose: 'any',
          },
          {
            src: 'icons/60x60-icon.png',
            type: 'image/png',
            sizes: '60x60',
            purpose: 'any',
          },
          {
            src: 'icons/64x64-icon.png',
            type: 'image/png',
            sizes: '64x64',
            purpose: 'any',
          },
          {
            src: 'icons/72x72-icon.png',
            type: 'image/png',
            sizes: '72x72',
            purpose: 'any',
          },
          {
            src: 'icons/80x80-icon.png',
            type: 'image/png',
            sizes: '80x80',
            purpose: 'any',
          },
          {
            src: 'icons/96x96-icon.png',
            type: 'image/png',
            sizes: '96x96',
            purpose: 'any',
          },
          {
            src: 'icons/256x256-icon.png',
            type: 'image/png',
            sizes: '256x256',
            purpose: 'any',
          },
          {
            src: 'icons/16x16-icon.png',
            type: 'image/png',
            sizes: '16x16',
            purpose: 'any',
          },
          {
            src: 'icons/20x20-icon.png',
            type: 'image/png',
            sizes: '20x20',
            purpose: 'any',
          },
          {
            src: 'icons/24x24-icon.png',
            type: 'image/png',
            sizes: '24x24',
            purpose: 'any',
          },
          {
            src: 'icons/30x30-icon.png',
            type: 'image/png',
            sizes: '30x30',
            purpose: 'any',
          },
          {
            src: 'icons/32x32-icon.png',
            type: 'image/png',
            sizes: '32x32',
            purpose: 'any',
          },
          {
            src: 'icons/36x36-icon.png',
            type: 'image/png',
            sizes: '36x36',
            purpose: 'any',
          },
          {
            src: 'icons/40x40-icon.png',
            type: 'image/png',
            sizes: '40x40',
            purpose: 'any',
          },
          {
            src: 'icons/44x44-icon.png',
            type: 'image/png',
            sizes: '44x44',
            purpose: 'any',
          },
          {
            src: 'icons/48x48-icon.png',
            type: 'image/png',
            sizes: '48x48',
            purpose: 'any',
          },
          {
            src: 'icons/60x60-icon.png',
            type: 'image/png',
            sizes: '60x60',
            purpose: 'any',
          },
          {
            src: 'icons/64x64-icon.png',
            type: 'image/png',
            sizes: '64x64',
            purpose: 'any',
          },
          {
            src: 'icons/72x72-icon.png',
            type: 'image/png',
            sizes: '72x72',
            purpose: 'any',
          },
          {
            src: 'icons/80x80-icon.png',
            type: 'image/png',
            sizes: '80x80',
            purpose: 'any',
          },
          {
            src: 'icons/96x96-icon.png',
            type: 'image/png',
            sizes: '96x96',
            purpose: 'any',
          },
          {
            src: 'icons/256x256-icon.png',
            type: 'image/png',
            sizes: '256x256',
            purpose: 'any',
          },
          {
            src: 'icons/512x512-icon.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any',
          },
          {
            src: 'icons/192x192-icon.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any',
          },
          {
            src: 'icons/144x144-icon.png',
            type: 'image/png',
            sizes: '144x144',
            purpose: 'any',
          },
          {
            src: 'icons/96x96-icon.png',
            type: 'image/png',
            sizes: '96x96',
            purpose: 'any',
          },
          {
            src: 'icons/72x72-icon.png',
            type: 'image/png',
            sizes: '72x72',
            purpose: 'any',
          },
          {
            src: 'icons/48x48-icon.png',
            type: 'image/png',
            sizes: '48x48',
            purpose: 'any',
          },
          {
            src: 'icons/16x16-icon.png',
            type: 'image/png',
            sizes: '16x16',
            purpose: 'any',
          },
          {
            src: 'icons/20x20-icon.png',
            type: 'image/png',
            sizes: '20x20',
            purpose: 'any',
          },
          {
            src: 'icons/29x29-icon.png',
            type: 'image/png',
            sizes: '29x29',
            purpose: 'any',
          },
          {
            src: 'icons/32x32-icon.png',
            type: 'image/png',
            sizes: '32x32',
            purpose: 'any',
          },
          {
            src: 'icons/40x40-icon.png',
            type: 'image/png',
            sizes: '40x40',
            purpose: 'any',
          },
          {
            src: 'icons/50x50-icon.png',
            type: 'image/png',
            sizes: '50x50',
            purpose: 'any',
          },
          {
            src: 'icons/57x57-icon.png',
            type: 'image/png',
            sizes: '57x57',
            purpose: 'any',
          },
          {
            src: 'icons/58x58-icon.png',
            type: 'image/png',
            sizes: '58x58',
            purpose: 'any',
          },
          {
            src: 'icons/60x60-icon.png',
            type: 'image/png',
            sizes: '60x60',
            purpose: 'any',
          },
          {
            src: 'icons/64x64-icon.png',
            type: 'image/png',
            sizes: '64x64',
            purpose: 'any',
          },
          {
            src: 'icons/72x72-icon.png',
            type: 'image/png',
            sizes: '72x72',
            purpose: 'any',
          },
          {
            src: 'icons/76x76-icon.png',
            type: 'image/png',
            sizes: '76x76',
            purpose: 'any',
          },
          {
            src: 'icons/80x80-icon.png',
            type: 'image/png',
            sizes: '80x80',
            purpose: 'any',
          },
          {
            src: 'icons/87x87-icon.png',
            type: 'image/png',
            sizes: '87x87',
            purpose: 'any',
          },
          {
            src: 'icons/100x100-icon.png',
            type: 'image/png',
            sizes: '100x100',
            purpose: 'any',
          },
          {
            src: 'icons/114x114-icon.png',
            type: 'image/png',
            sizes: '114x114',
            purpose: 'any',
          },
          {
            src: 'icons/120x120-icon.png',
            type: 'image/png',
            sizes: '120x120',
            purpose: 'any',
          },
          {
            src: 'icons/128x128-icon.png',
            type: 'image/png',
            sizes: '128x128',
            purpose: 'any',
          },
          {
            src: 'icons/144x144-icon.png',
            type: 'image/png',
            sizes: '144x144',
            purpose: 'any',
          },
          {
            src: 'icons/152x152-icon.png',
            type: 'image/png',
            sizes: '152x152',
            purpose: 'any',
          },
          {
            src: 'icons/167x167-icon.png',
            type: 'image/png',
            sizes: '167x167',
            purpose: 'any',
          },
          {
            src: 'icons/180x180-icon.png',
            type: 'image/png',
            sizes: '180x180',
            purpose: 'any',
          },
          {
            src: 'icons/192x192-icon.png',
            type: 'image/png',
            sizes: '192x192',
            purpose: 'any',
          },
          {
            src: 'icons/256x256-icon.png',
            type: 'image/png',
            sizes: '256x256',
            purpose: 'any',
          },
          {
            src: 'icons/512x512-icon.png',
            type: 'image/png',
            sizes: '512x512',
            purpose: 'any',
          },
          {
            src: 'icons/1024x1024-icon.png',
            type: 'image/png',
            sizes: '1024x1024',
            purpose: 'any',
          },
        ],
        start_url: '.',
        display: 'standalone',
        theme_color: '#523ABB',
        background_color: '#523ABB',
        display_override: ['window-controls-overlay'],
        protocol_handlers: [
          {
            protocol: 'web+cristata',
            url: '/proto?url=%s',
          },
          {
            protocol: 'web+paladincristata',
            url: '/proto?url=%s',
          },
        ],
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 10485760, // 10 MiB
      },
      filename: 'service-worker.js',
      injectRegister: 'inline',
    }),
    codegen(),
    // Put the Sentry vite plugin after all other plugins
    sentryVitePlugin({
      org: 'jack-buehner',
      project: 'cristata-app',
      include: './dist',
      release: process.env.VITE_BUILD_START_DATE_TIME,

      // Auth tokens can be obtained from https://sentry.io/settings/account/api/auth-tokens/
      // and need `project:releases` and `org:read` scopes
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE_ISO__: JSON.stringify(new Date().toISOString),
  },
  server: {
    port: parseInt(process.env.PORT || '4000'),
  },
  build: {
    rollupOptions: {
      external: [],
      cache: false,
    },
    sourcemap: false,
  },
  ssr: {
    // add libraries containing invalid ESM here
    noExternal: [],
  },
});
