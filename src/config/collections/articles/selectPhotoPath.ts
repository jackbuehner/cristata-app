import { IPhoto } from '../../../interfaces/cristata/photos';
import { db } from '../../../utils/axios/db';

async function selectPhotoPath(inputValue: string) {
  // get all photos
  const { data: photos }: { data: IPhoto[] } = await db.get(`/photos`);

  // with the data, create the options array
  let options: Array<{ value: string; label: string }> = [];
  photos.forEach((photo) => {
    if (photo.people?.photo_created_by) {
      options.push({
        value: photo.photo_url,
        label: photo.name || photo._id,
      });
    }
  });

  // filter the options based on `inputValue`
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(inputValue.toLowerCase())
  );

  // return the filtered options
  return filteredOptions;
}

export { selectPhotoPath };
