import { FieldDef } from '@jackbuehner/cristata-generator-schema';
import { DropResult, ResponderProvided } from 'react-beautiful-dnd';
import { useOptions } from '../ContentField/useOptions';
import { CollaborativeFieldProps, CollaborativeFieldWrapper } from './';
import { CollaborativeCombobox, PopulatedRefValue, Value, Values } from './CollaborativeCombobox';
import { SelectedReferenceItems } from './SelectedReferenceItems';

interface CollaborativeReferenceManyProps extends CollaborativeFieldProps {
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
  const { y, onChange, injectedOptions, noDrag, collection, reference, ...labelProps } = props;
  const yarray = y.ydoc?.getArray<Value<string>>(y.field);

  // generate options from the referenced collection
  // based on a provided search string
  const [searchValue, setSearchValue, { options, loading }] = useOptions(props.collection, props.reference);

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
        many={true}
        color={props.color}
        font={props.font}
        onChange={(values) => {
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
          disabled={props.disabled}
          onDragEnd={onDragEnd}
          fieldName={y.field}
          font={props.font}
          y={{ ...y, ydoc: y.ydoc }}
          color={props.color}
          noDrag={props.noDrag}
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

export { CollaborativeReferenceMany };
