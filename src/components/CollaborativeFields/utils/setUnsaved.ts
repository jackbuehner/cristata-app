import * as Y from 'yjs';

function setUnsaved(ydoc: Y.Doc | undefined, fieldName: string) {
  const __unsavedFields = ydoc?.getArray('__unsavedFields');
  const unsavedFields = __unsavedFields?.toArray();
  console.log(fieldName, ydoc);
  if (unsavedFields && !unsavedFields.includes(fieldName)) {
    __unsavedFields?.push([fieldName]);
  }
}

export { setUnsaved };
