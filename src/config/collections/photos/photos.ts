import { IPhoto } from '../../../interfaces/cristata/photos';
import { IProfile } from '../../../interfaces/cristata/profiles';
import { collection } from '../../collections';

const photos: collection<IPhoto> = {
  home: '/cms/photos/library',
  fields: [
    { key: 'name', label: 'Name', type: 'text', description: 'The name of the photo in the CMS.' },
    {
      key: 'people.photo_created_by',
      label: 'Source',
      type: 'text',
      description:
        'The photographer or artist of the photo. Be sure to credit the photographer/artist appropriately and correctly.\n\n <b>Guidelines</b>\n <i>Staff photographers</i>: Photographer/The Paladin \n <i>Freelance or club photographers</i>: Photographer for The Paladin \n <i>Purchased photos</i>: Photographer \n <i>Free photos with permission</i>: Courtesy of Photographer \n <i>Photos from AP, Getty photos, Flikr, etc.</i>: Photographer/Organization \n <i>Photos from Unsplash</i>: Photographer \\\\ Unsplash \n <i>Images from photo sites that are credited as "uncredited"</i>: Organization \n <i>Photos from Furman News</i>: Determine the actual source of the photo \n\n <b>Other notes</b> \n Do not use a photo if you are not 100% sure we can legally use it. Familiarize yourself with <a href="https://creativecommons.org/about/cclicenses/">the different Creative Commons licenses</a>. \n\n <b>Helpful resources</b> \n <a href="https://search.creativecommons.org/">Creative Commons content search</a> \n <a href="https://www.pexels.com/creative-commons-images/">Pexels Creative Commons Images</a> \n <a href="https://www.flickr.com/creativecommons/">Flikr Creative Commons explore page</a> \n <a href="https://unsplash.com/images/stock/creative-common">Unsplash Creative Commons Images</a> \n\n',
    },
    {
      key: 'tags',
      label: 'Tags',
      type: 'multiselect_creatable',
      description: 'Keywords related to the photo. Allows easier searching for photos.',
    },
  ],
  columns: [],
};

export { photos };
