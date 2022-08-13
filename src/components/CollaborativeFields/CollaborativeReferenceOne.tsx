import { FieldDef } from '@jackbuehner/cristata-api/dist/api/graphql/helpers/generators/genSchema';
import { useState } from 'react';
import { CollaborativeFieldProps, CollaborativeFieldWrapper } from '.';
import { useOptions } from '../ContentField/useOptions';
import { CollaborativeCombobox, PopulatedRefValue, Values } from './CollaborativeCombobox';
import { SelectedReferenceItems } from './SelectedReferenceItems';

interface CollaborativeReferenceOneProps extends CollaborativeFieldProps {
  onChange?: (value: PopulatedRefValue | null) => void;
  injectedOptions?: Values<string>;
  /**
   * Singular collection name.
   */
  collection: string;
  reference?: FieldDef['reference'];
}

function CollaborativeReferenceOne(props: CollaborativeReferenceOneProps) {
  const { y, onChange, injectedOptions, collection, reference, ...labelProps } = props;

  // generate options from the referenced collection
  // based on a provided search string
  const [searchValue, setSearchValue, { options, loading }] = useOptions(props.collection, props.reference);

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
      <CollaborativeFieldWrapper {...labelProps} y={y} label={props.label}>
        {Content}
      </CollaborativeFieldWrapper>
    );
  }

  return Content;
}

export { CollaborativeReferenceOne };
