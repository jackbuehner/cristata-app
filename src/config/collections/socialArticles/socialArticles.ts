import { collection } from '../../collections';
import { IArticle } from '../articles/articles';
import { selectArticle } from './selectArticle';

const socialArticles: collection<ISocialArticles> = {
  home: '/cms/item/social-articles/615ff1210e3e31a22a3c5746',
  query: {
    name: {
      singular: 'setting',
      plural: 'settings',
    },
    identifier: '_id',
    force: ['name'],
  },
  fields: [
    {
      key: 'monday',
      from: 'setting',
      label: 'Monday',
      type: 'multiselect_async',
      async_options: (val, client) => selectArticle(val, client),
      dataType: 'string',
    },
    {
      key: 'tuesday',
      from: 'setting',
      label: 'Tuesday',
      type: 'multiselect_async',
      async_options: (val, client) => selectArticle(val, client),
      dataType: 'string',
    },
    {
      key: 'wednesday',
      from: 'setting',
      label: 'Wednesday',
      type: 'multiselect_async',
      async_options: (val, client) => selectArticle(val, client),
      dataType: 'string',
    },
    {
      key: 'thursday',
      from: 'setting',
      label: 'Thursday',
      type: 'multiselect_async',
      async_options: (val, client) => selectArticle(val, client),
      dataType: 'string',
    },
    {
      key: 'friday',
      from: 'setting',
      label: 'Friday',
      type: 'multiselect_async',
      async_options: (val, client) => selectArticle(val, client),
      dataType: 'string',
    },
    {
      key: 'saturday',
      from: 'setting',
      label: 'Saturday',
      type: 'multiselect_async',
      async_options: (val, client) => selectArticle(val, client),
      dataType: 'string',
    },
    {
      key: 'sunday',
      from: 'setting',
      label: 'Sunday',
      type: 'multiselect_async',
      async_options: (val, client) => selectArticle(val, client),
      dataType: 'string',
    },
  ],
  columns: [],
  collectionName: 'settings',
};

interface ISocialArticles {
  setting: {
    monday: IArticle;
    tuesday: IArticle;
    wednesday: IArticle;
    thursday: IArticle;
    friday: IArticle;
    saturday: IArticle;
    sunday: IArticle;
  };
}

export { socialArticles };
