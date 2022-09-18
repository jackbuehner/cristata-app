import { EntryY } from '../../Tiptap/hooks/useY';

function setUnsaved(y: EntryY, fieldName: string) {
  const __unsavedFields = y.ydoc?.getArray('__unsavedFields');
  const unsavedFields = __unsavedFields?.toArray();
  if (unsavedFields && !unsavedFields.includes(fieldName) && !unsavedFields.includes('__comboboxEntry')) {
    __unsavedFields?.push([fieldName]);
  }
}

export { setUnsaved };
