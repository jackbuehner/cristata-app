import adapter from '@sveltejs/adapter-vercel';
import preprocess from 'svelte-preprocess';
import preprocessReact from 'svelte-preprocess-react/preprocessReact';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: preprocessReact({
    preprocess: preprocess({ sourceMap: true }),
  }),

  kit: {
    adapter: adapter(),
    alias: {
      $components: 'src/components',
      $utils: 'src/utils',
      $react: 'src/pages',
    },
  },
};

export default config;
