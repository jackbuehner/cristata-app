import { isURL } from '$utils/isURL';
import { openWindow } from '$utils/openWindow';
import type { FieldDef } from '@jackbuehner/cristata-generator-schema';
import pluralize from 'pluralize';

export function handleOpenReference(
  _id: string,
  reference: FieldDef['reference'] & { collection: string },
  tenant: string
) {
  if (isURL(_id)) {
    openWindow(_id, reference?.collection + _id, 'location=no');
  } else if (reference?.collection.toLowerCase() === 'user') {
    openWindow(`/${tenant}/profile/${_id}`, reference?.collection + _id, 'location=no');
  } else if (reference?.collection.toLowerCase() === 'team') {
    openWindow(`/${tenant}/teams/${_id}`, reference?.collection + _id, 'location=no');
  } else if (reference?.collection.toLowerCase() === 'photo') {
    openWindow(`/${tenant}/cms/photo/library/${_id}`, reference?.collection + _id, 'location=no');
  } else {
    openWindow(
      `/${tenant}/cms/collection/${pluralize(reference?.collection.toLowerCase() || '')}/${_id}`,
      reference?.collection + _id,
      'location=no'
    );
  }
}
