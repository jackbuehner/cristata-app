import { useEffect, useState } from 'react';
import type { YArray } from 'yjs/dist/src/types/YArray';
import type { useAwareness } from '../Tiptap/hooks';
import type { Value, Values } from './CollaborativeCombobox';

interface Input {
  initialValues?: Values<string>;
  yarray?: YArray<Value<string>>;
  initialSynced: boolean;
  awareness: ReturnType<typeof useAwareness>;
}

/**
 * if there are provided initial values and there are no values
 * defined in the ydoc shared type, use the initial values
 * in the shared type array for selected items
 * @param extraCondition this condition must be true for the yarrayto be set with the initial values
 */
function useSetInitialYarray(props: Input, extraCondition: boolean = true) {
  const [hasSetInitialValue, setHasSetInitialValue] = useState(false);
  useEffect(() => {
    if (
      props.initialValues &&
      props.initialValues.length > 0 &&
      props.yarray &&
      props.yarray.toArray().length === 0 &&
      props.initialSynced &&
      !hasSetInitialValue &&
      extraCondition
      //selected.length === 0
    ) {
      // only insert if there are no other clients connected
      // (otherwise, they probably already inserted the initial values
      // and may have removed them before this client connected)
      if (props.awareness.length === 1) {
        props.yarray.insert(0, props.initialValues);
      }
      setHasSetInitialValue(true);
    }
  }, [
    props.initialValues,
    hasSetInitialValue,
    props.yarray,
    props.initialSynced,
    props.awareness.length,
    extraCondition,
  ]);
}

export { useSetInitialYarray };
