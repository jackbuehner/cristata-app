import { collection } from '../../collections';
import { IArticle } from '../articles/articles';
import { selectArticle } from './selectArticle';

const featuredSettings: collection<IFeaturedSettings> = {
  home: '/cms/item/featured-settings/6101da4a5386ae9ea3147f17',
  fields: [
    {
      key: 'setting.first',
      label: 'First article',
      type: 'select_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.second',
      label: 'Second article',
      type: 'select_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.third',
      label: 'Third article',
      type: 'select_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.fourth',
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
