import { collection } from '../../collections';
import { selectArticle } from './selectArticle';

const socialArticles: collection = {
  home: '/cms/item/social-articles/615ff1210e3e31a22a3c5746',
  fields: [
    {
      key: 'setting.monday',
      label: 'Monday',
      type: 'multiselect_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.tuesday',
      label: 'Tuesday',
      type: 'multiselect_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.wednesday',
      label: 'Wednesday',
      type: 'multiselect_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.thursday',
      label: 'Thursday',
      type: 'multiselect_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.friday',
      label: 'Friday',
      type: 'multiselect_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.saturday',
      label: 'Saturday',
      type: 'multiselect_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
    {
      key: 'setting.sunday',
      label: 'Sunday',
      type: 'multiselect_async',
      async_options: (val) => selectArticle(val),
      dataType: 'string',
    },
  ],
  columns: [],
  collectionName: 'settings',
};

export { socialArticles };
