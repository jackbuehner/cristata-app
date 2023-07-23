<script lang="ts">
  import { notEmpty } from '@jackbuehner/cristata-utils';
  import arrayDifferences from 'array-differences';
  import { onMount, type ComponentProps } from 'svelte';
  import type * as Y from 'yjs';
  import type { SchemaField } from '../Field';
  import Items from './Items.svelte';

  export let schemaFieldParams: ComponentProps<SchemaField>;
  $: ({ ydoc } = schemaFieldParams);
  export let ydocKey: string = '';

  type YArr = Record<string, unknown> & { __uuid: string };
  type YArrExtended = YArr & { _id: string };

  // this will be updated by a subsriber to ydoc, which is why this is not marked reactive
  let yarray = $ydoc?.getArray<YArr>(ydocKey);
  let arr = (yarray?.toArray() || [])
    .filter(notEmpty)
    .map((item): YArrExtended => ({ ...item, _id: item.__uuid }));

  let oldArr = arr;
  function handleDragFinalize(evt: CustomEvent<YArr[]> | YArr[]) {
    if (!$ydoc) return;

    let duplicatesExist = false;
    let newArr: (YArr | YArrExtended)[] = [];
    (Array.isArray(evt) ? evt : evt.detail).forEach((item) => {
      if (newArr.some((e) => e.__uuid === item.__uuid)) {
        duplicatesExist = true;
        return;
      }
      newArr.push(item);
    });

    // if there are duplicates, simply reset the ydoc shared value
    // to match the array value with duplicates removed
    if (yarray && yarray.length > newArr.length) duplicatesExist = true;
    if (duplicatesExist) {
      $ydoc.transact(() => {
        if (!yarray) return;

        const lengthToDelete = yarray.length;
        yarray.delete(0, lengthToDelete);

        yarray.insert(0, newArr);
      });
      return;
    }

    // calculate the difference between the old options and the new options
    // so that a ydoc transaction can be created that only contains
    // the exact differences
    const diff = arrayDifferences(oldArr, newArr || arr);
    if (diff.length === 0) return;

    // update the ydoc shared type value
    $ydoc.transact(() => {
      diff.forEach(([diffType, index, maybeArr]) => {
        if (!yarray) return;

        if (diffType === 'deleted') {
          yarray.delete(index);
          return;
        }

        // maybeArr is only supposed to be undefined when diffType === 'deleted'
        if (!maybeArr) return;
        const { _id, ...rest } = maybeArr;
        const option: YArr = {
          ...rest,
        };

        if (diffType === 'inserted') {
          yarray.insert(index, [option]);
          return;
        }

        if (diffType === 'modified') {
          // remove from existing location
          yarray.delete(index);

          // add to new location
          yarray.insert(index, [option]);

          return;
        }
      });
    });

    // finally, update the old arr
    oldArr = newArr.filter(notEmpty).map((item): YArrExtended => ({ ...item, _id: item.__uuid })) || arr;
  }

  onMount(() => {
    // listen for changes in the array shared type
    ydoc?.subscribe(
      ($ydoc) => {
        yarray = $ydoc?.getArray<YArr>(ydocKey);
        if (!yarray) return;

        // ensure the initial value matches the shared type value
        if (JSON.stringify(arr) !== JSON.stringify(yarray.toArray())) {
          const yarrayValue = yarray
            .toArray()
            .filter(notEmpty)
            .map((item): YArrExtended => ({ ...item, _id: item.__uuid }));

          const hasDuplicates = new Set(yarrayValue.map((a) => a.__uuid)).size !== yarrayValue.length;
          if (hasDuplicates) handleDragFinalize(yarrayValue);

          arr = yarrayValue;
          oldArr = yarrayValue;
        }

        yarray.observe(handleYArrayChange);
      },
      () => {
        // stop listening for changes in the array shared type
        // during cleanup to prevent memory leaks
        yarray?.unobserve(handleYArrayChange);
      }
    );

    /**
     * Handle changes to y array shared type by updating the selected options and old selected options
     */
    function handleYArrayChange(evt: Y.YArrayEvent<YArr>) {
      const yarray = $ydoc?.getArray<YArr>(ydocKey);

      if (yarray && evt.changes.delta) {
        const yarrayValue = yarray
          .toArray()
          .filter(notEmpty)
          .map((item): YArrExtended => ({ ...item, _id: item.__uuid }));

        const hasDuplicates = new Set(yarrayValue.map((a) => a.__uuid)).size !== yarrayValue.length;
        if (hasDuplicates) handleDragFinalize(yarrayValue);

        arr = yarrayValue;
        oldArr = yarrayValue;
      }
    }
  });
</script>

<Items
  {schemaFieldParams}
  {ydocKey}
  bind:arr
  on:dragfinalize={handleDragFinalize}
  on:dismiss={handleDragFinalize}
  on:dismissall={handleDragFinalize}
  on:add={handleDragFinalize}
/>
