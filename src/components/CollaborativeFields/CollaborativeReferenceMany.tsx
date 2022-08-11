import { useApolloClient } from '@apollo/client';
import { FieldDef } from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import { useEffect, useState } from 'react';
import { DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { CollaborativeFieldProps } from '.';
import { Field } from '../ContentField/Field';
import { populateReferenceValues } from '../ContentField/populateReferenceValues';
import { useOptions } from '../ContentField/useOptions';
import {
  CollaborativeCombobox,
  PopulatedRefValue,
  UnpopulatedRefValue,
  Value,
  Values,
} from './CollaborativeCombobox';
import { SelectedReferenceItems } from './SelectedReferenceItems';

interface CollaborativeReferenceManyProps extends CollaborativeFieldProps {
  initialValues?: UnpopulatedRefValue[];
  onChange?: (values: PopulatedRefValue[]) => void;
  injectedOptions?: Values<string>;
  noDrag?: boolean;
  /**
   * Singular collection name.
   */
  collection: string;
  reference?: FieldDef['reference'];
}

function CollaborativeReferenceMany(props: CollaborativeReferenceManyProps) {
  const { y, initialValues, onChange, injectedOptions, noDrag, collection, reference, ...labelProps } = props;
  const yarray = y.ydoc?.getArray<Value<string>>(y.field);

  const client = useApolloClient();

  // generate options from the referenced collection
  // based on a provided search string
  const [searchValue, setSearchValue, { options, loading }] = useOptions(props.collection, props.reference);

  // populate the initial value with a label based on the name field
  // in the referenced collection (or another field defined in the reference object)
  const [populatedInitialValues, setPopulatedInitialValues] = useState<PopulatedRefValue[]>([]);
  useEffect(() => {
    populateReferenceValues(client, initialValues || [], collection, reference?.fields).then((values) => {
      setPopulatedInitialValues(values);
    });
  }, [client, collection, initialValues, reference?.fields, yarray]);

  const onDragEnd = (result: DropResult, provided: ResponderProvided) => {
    const from = result.source.index;
    const to = result.destination?.index;
    const items = yarray?.toArray();
    if (from !== undefined && to !== undefined && yarray && items) {
      y.ydoc?.transact(() => {
        // remove from existing location
        yarray.delete(from);

        // add to new location
        yarray.insert(to, [items[from]]);
      });
    }
  };

  const Content = (
    <div style={{ position: 'relative' }}>
      <CollaborativeCombobox
        y={props.y}
        disabled={props.disabled}
        options={[...(props.injectedOptions || []), ...options]}
        initialValues={populatedInitialValues.map(({ _id: value, label }) => ({ value, label }))}
        many={true}
        color={props.color}
        font={props.font}
        onChange={(values) => {
          if (values.length === 0) setPopulatedInitialValues([]);

          props.onChange?.(
            values.map(({ value, label, children, ...rest }) => ({ _id: value.toString(), label, ...rest }))
          );
        }}
        onSearchChange={(value) => setSearchValue(value)}
        notFoundContent={
          loading && searchValue ? 'Loading...' : !searchValue ? 'Start typing to search.' : undefined
        }
      />
      {y.ydoc ? (
        <SelectedReferenceItems
          onDragEnd={onDragEnd}
          fieldName={y.field}
          font={props.font}
          ydoc={y.ydoc}
          color={props.color}
          noDrag={props.noDrag}
          collection={props.collection}
        />
      ) : null}
    </div>
  );

  if (props.label) {
    return (
      <Field {...labelProps} label={props.label}>
        {Content}
      </Field>
    );
  }

  return Content;
}

export { CollaborativeReferenceMany };
