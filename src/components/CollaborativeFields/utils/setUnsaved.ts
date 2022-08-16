import AwesomeDebouncePromise from 'awesome-debounce-promise';
import { saveChanges } from '../../../pages/CMS/CollectionItemPage/saveChanges';
import { EntryY, IYSettingsMap } from '../../Tiptap/hooks/useY';

const debouncedSave = AwesomeDebouncePromise(async (y: EntryY) => {
  const ySettingsMap = y.ydoc?.getMap<IYSettingsMap>('__settings');
  const autosave: boolean | undefined | null = ySettingsMap?.get('autosave');
  if (autosave) saveChanges(y);
}, 1000); // one second

function setUnsaved(y: EntryY, fieldName: string) {
  const __unsavedFields = y.ydoc?.getArray('__unsavedFields');
  const unsavedFields = __unsavedFields?.toArray();
  if (unsavedFields && !unsavedFields.includes(fieldName) && !unsavedFields.includes('__comboboxEntry')) {
    __unsavedFields?.push([fieldName]);
  }

  // automatically save the changes if autosave === trues
  debouncedSave(y);
}

export { setUnsaved };
