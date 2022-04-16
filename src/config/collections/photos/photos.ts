import { IPhoto } from '../../../interfaces/cristata/photos';
import { collection } from '../../collections';

const photos: collection<IPhoto> = {
  home: '/cms/photos/library',
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
