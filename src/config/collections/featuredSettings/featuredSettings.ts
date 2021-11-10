import { collection } from '../../collections';
import { IArticle } from '../articles/articles';
import { selectArticle } from './selectArticle';

const featuredSettings: collection<IFeaturedSettings> = {
  home: '/cms/item/featured-settings/6101da4a5386ae9ea3147f17',
  query: {
    name: {
      singular: 'setting',
      plural: 'settings',
    },
    identifier: '_id',
  },
  fields: [
    {
      key: 'first',
      from: 'setting',
      label: 'First article',
      type: 'select_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'second',
      from: 'setting',
      label: 'Second article',
      type: 'select_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'third',
      from: 'setting',
      label: 'Third article',
      type: 'select_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'fourth',
      from: 'setting',
      label: 'Fourth article',
      type: 'select_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
  ],
  columns: [],
  collectionName: 'settings',
};

interface IFeaturedSettings {
  setting: {
    first: IArticle;
    second: IArticle;
    third: IArticle;
    fourth: IArticle;
  };
}

export { featuredSettings };
