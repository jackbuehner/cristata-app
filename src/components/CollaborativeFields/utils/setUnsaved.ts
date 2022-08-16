import { saveChanges } from '../../../pages/CMS/CollectionItemPage/saveChanges';
import { EntryY, IYSettingsMap } from '../../Tiptap/hooks/useY';

function setUnsaved(y: EntryY, fieldName: string) {
  const __unsavedFields = y.ydoc?.getArray('__unsavedFields');
  const unsavedFields = __unsavedFields?.toArray();
  if (unsavedFields && !unsavedFields.includes(fieldName) && !unsavedFields.includes('__comboboxEntry')) {
    __unsavedFields?.push([fieldName]);
  }

  // automatically save the changes if autosave === true
  const ySettingsMap = y.ydoc?.getMap<IYSettingsMap>('__settings');
  const autosave: boolean | undefined | null = ySettingsMap?.get('autosave');
  if (autosave) saveChanges(y);
}

export { setUnsaved };
