import type { FieldDef } from '@jackbuehner/cristata-generator-schema';
import { get as getProperty } from '$utils/objectPath';
import { useOptions } from '../ContentField/useOptions';
import type { CollaborativeFieldProps } from './';
import { CollaborativeFieldWrapper } from './';
import type { PopulatedRefValue, Values } from './CollaborativeCombobox';
import { CollaborativeCombobox } from './CollaborativeCombobox';
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

  // hide the combobox (via css) when an item is selected
  const visible = getProperty(y.fullData, y.field)?.length === 0 || !getProperty(y.fullData, y.field);

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
              props.onChange?.({ ...firstValue, _id: firstValue.value.toString() });
            } else {
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
          y={{ ...y, ydoc: y.ydoc }}
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
