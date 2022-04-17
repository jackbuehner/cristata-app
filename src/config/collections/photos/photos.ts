import { collection } from '../../collections';

const photos: collection = {
  query: {
    name: {
      singular: 'photo',
      plural: 'photos',
    },
    identifier: '_id',
  },
  columns: [],
};

export { photos };
