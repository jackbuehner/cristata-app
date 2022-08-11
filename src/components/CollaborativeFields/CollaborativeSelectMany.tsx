import styled from '@emotion/styled/macro';
import { Add20Regular } from '@fluentui/react-icons';
import { InputHTMLAttributes, useState } from 'react';
import { DropResult, ResponderProvided } from 'react-beautiful-dnd';
import {
  CollaborativeFieldProps,
  CollaborativeFieldWrapper,
  CollaborativeNumberField,
  CollaborativeTextField,
} from '.';
import { IconButton } from '../Button';
import { CollaborativeCombobox, Value, Values } from './CollaborativeCombobox';
import { SelectedItems } from './SelectedItems';
import { useSetInitialYarray } from './useSetInitialYarray';

interface CollaborativeSelectManyProps
  extends CollaborativeFieldProps,
    Omit<Omit<Omit<Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, 'onChange'>, 'color'>, 'checked'> {
  initialValues?: Values<string>;
  onChange?: (values: Values<string>) => void;
  options?: Values<string>;
  noDrag?: boolean;
  number?: 'integer' | 'decimal';
}

function CollaborativeSelectMany(props: CollaborativeSelectManyProps) {
  const { y, defaultValue, onChange, ...labelProps } = props;
  const yarray = y.ydoc?.getArray<Value<string>>(y.field);

  // create yarray only if combobox is not going to be used
  // (combobox creates the shared type already)
  useSetInitialYarray(
    { initialSynced: y.initialSynced, initialValues: props.initialValues, yarray, awareness: y.awareness },
    !props.options
  );

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

  // handle state for string type
  const [textValue, setTextValue] = useState<string>('');
  const addTextValueToInternalState = () => {
    const textFieldSharedType = y.ydoc?.getXmlFragment('__comboboxEntry.' + props.y.field);
    if (textValue !== '' && yarray && textFieldSharedType) {
      y.ydoc?.transact(() => {
        yarray.push([{ value: textValue, label: textValue }]);
        textFieldSharedType.delete(0, textFieldSharedType.toDOM().textContent?.length);
      });
      setTextValue('');
    }
  };

  // handle state for number type
  const [numberValue, setNumberValue] = useState<number | undefined>(undefined);
  const addNumberValueToInternalState = () => {
    const numberFieldSharedType = y.ydoc?.getXmlFragment('__comboboxEntry.' + props.y.field);
    if (numberValue && yarray && numberFieldSharedType) {
      y.ydoc?.transact(() => {
        yarray.push([{ value: numberValue.toString(), label: textValue }]);
        numberFieldSharedType.delete(0, numberFieldSharedType.toDOM().textContent?.length);
      });
      setNumberValue(undefined);
    }
  };

  const Content = (() => {
    if (props.options) {
      return (
        <div style={{ position: 'relative' }}>
          <CollaborativeCombobox
            y={props.y}
            disabled={props.disabled}
            options={props.options}
            initialValues={props.initialValues}
            many={true}
            color={props.color}
            font={props.font}
            onChange={props.onChange}
          />
          {y.ydoc ? (
            <SelectedItems
              disabled={props.disabled}
              onDragEnd={onDragEnd}
              fieldName={y.field}
              font={props.font}
              ydoc={y.ydoc}
              color={props.color}
              noDrag={props.noDrag}
            />
          ) : null}
        </div>
      );
    }

    if (!y.ydoc) return <pre>`y.ydoc` is mising</pre>;

    if (props.number) {
      return (
        <div style={{ position: 'relative' }}>
          <CollaborativeNumberField
            y={{ ...props.y, field: '__comboboxEntry.' + props.y.field }}
            disabled={props.disabled}
            style={{ paddingRight: '42px' }}
            allowDecimals={props.number === 'decimal'}
            color={props.color}
            font={props.font}
            label={'__in-select'}
            onChange={(content, number) => {
              setNumberValue(number);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addNumberValueToInternalState();
              }
            }}
          />
          <AddButton
            icon={<Add20Regular />}
            onClick={addNumberValueToInternalState}
            disabled={props.disabled}
          />
          <SelectedItems
            disabled={props.disabled}
            onDragEnd={onDragEnd}
            fieldName={y.field}
            font={props.font}
            ydoc={y.ydoc}
            color={props.color}
            noDrag={props.noDrag}
          />
        </div>
      );
    }

    return (
      <div style={{ position: 'relative' }}>
        <CollaborativeTextField
          y={{ ...props.y, field: '__comboboxEntry.' + props.y.field }}
          disabled={props.disabled}
          style={{ paddingRight: '42px' }}
          color={props.color}
          font={props.font}
          label={'__in-select'}
          onChange={(content, text) => {
            setTextValue(text);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              addTextValueToInternalState();
            }
          }}
        />
        <AddButton icon={<Add20Regular />} onClick={addTextValueToInternalState} disabled={props.disabled} />
        <SelectedItems
          disabled={props.disabled}
          onDragEnd={onDragEnd}
          fieldName={y.field}
          font={props.font}
          ydoc={y.ydoc}
          color={props.color}
          noDrag={props.noDrag}
        />
      </div>
    );
  })();

  if (props.label) {
    return (
      <CollaborativeFieldWrapper {...labelProps} y={y} label={props.label}>
        {Content}
      </CollaborativeFieldWrapper>
    );
  }

  return Content;
}

const AddButton = styled(IconButton)`
  position: absolute;
  top: 1px;
  right: 0;
  border-color: transparent !important;
  height: 34px;
  width: 34px;
`;

export { CollaborativeSelectMany };
