import { useApolloClient } from '@apollo/client';
import { FieldDef } from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import { useEffect, useState } from 'react';
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

interface CollaborativeReferenceOneProps extends CollaborativeFieldProps {
  initialValue?: UnpopulatedRefValue;
  onChange?: (value: PopulatedRefValue | null) => void;
  injectedOptions?: Values<string>;
  /**
   * Singular collection name.
   */
  collection: string;
  reference?: FieldDef['reference'];
}

function CollaborativeReferenceOne(props: CollaborativeReferenceOneProps) {
  const { y, initialValue, onChange, injectedOptions, collection, reference, ...labelProps } = props;
  const yarray = y.ydoc?.getArray<Value<string>>(y.field);

  const client = useApolloClient();

  // generate options from the referenced collection
  // based on a provided search string
  const [searchValue, setSearchValue, { options, loading }] = useOptions(props.collection, props.reference);

  // populate the initial value with a label based on the name field
  // in the referenced collection (or another field defined in the reference object)
  const [populatedInitialValue, setPopulatedInitialValue] = useState<PopulatedRefValue | undefined>(undefined);
  useEffect(() => {
    if (!initialValue) setPopulatedInitialValue(undefined);
    else {
      populateReferenceValues(client, initialValue ? [initialValue] : [], collection, reference?.fields).then(
        (values) => {
          setPopulatedInitialValue(values[0]);
        }
      );
    }
  }, [client, collection, initialValue, reference?.fields, yarray]);

  // toggle to show/hide the combobox (via css)
  // so that it is hidden when an item is selected
  const [visible, setVisible] = useState(true);

  const Content = (
    <div style={{ position: 'relative' }}>
      <div style={{ display: visible ? 'block' : 'none' }}>
        <CollaborativeCombobox
          y={props.y}
          disabled={props.disabled}
          options={[...(props.injectedOptions || []), ...options]}
          initialValues={
            populatedInitialValue
              ? [populatedInitialValue].map(({ _id: value, label }) => ({ value, label }))
              : []
          }
          many={false}
          color={props.color}
          font={props.font}
          onChange={(values) => {
            const firstValue = values[0];
            if (firstValue) {
              setVisible(false);
              props.onChange?.({ ...firstValue, _id: firstValue.value.toString() });
            } else {
              setVisible(true);
              setPopulatedInitialValue(undefined);
              props.onChange?.(null);
            }
          }}
          onSearchChange={(value) => setSearchValue(value)}
          notFoundContent={
            loading && searchValue ? 'Loading...' : !searchValue ? 'Start typing to search.' : undefined
          }
        />
      </div>
      {y.ydoc ? (
        <SelectedReferenceItems
          disabled={props.disabled}
          onDragEnd={() => null}
          fieldName={y.field}
          font={props.font}
          ydoc={y.ydoc}
          color={props.color}
          noDrag
          many={false}
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

export { CollaborativeReferenceOne };
