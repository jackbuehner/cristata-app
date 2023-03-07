import adapterStatic from '@sveltejs/adapter-static';
import adapterVercel from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import preprocessReact from 'svelte-preprocess-react/preprocessReact';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocessReact({
    preprocess: preprocess({ sourceMap: true }),
  }),

  kit: {
    adapter:
      process.env.ADAPTER === 'static'
        ? adapterStatic({
            pages: 'build',
            assets: 'build',
            fallback: 'index.html',
            precompress: true,
            strict: true,
          })
        : adapterVercel(),
    alias: {
      $components: 'src/components',
      $utils: 'src/utils',
      $react: 'src/pages',
      $lib: 'src/lib',
      $common: 'src/lib/common',
      $stores: 'src/stores',
      $graphql: 'src/graphql',
    },
    env: {
      publicPrefix: 'VITE_',
    },
    prerender: {
      crawl: false,
      entries: ['*'],
    },
  },
};

export default config;
