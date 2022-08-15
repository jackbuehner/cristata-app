import * as Y from 'yjs';

function setUnsaved(ydoc: Y.Doc | undefined, fieldName: string) {
  const __unsavedFields = ydoc?.getArray('__unsavedFields');
  const unsavedFields = __unsavedFields?.toArray();
  if (unsavedFields && !unsavedFields.includes(fieldName) && !unsavedFields.includes('__comboboxEntry')) {
    __unsavedFields?.push([fieldName]);
  }
}

export { setUnsaved };
