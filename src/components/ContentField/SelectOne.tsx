import { useState } from 'react';
import { colorType, themeType } from '../../utils/theme/theme';
import { Combobox, Number, Text } from './';
import { Field, FieldProps } from './Field';

interface SelectOneProps extends Omit<FieldProps, 'children'> {
  type: 'String' | 'Float' | 'Int';
  value?: StringValue | NumberValue;
  color?: colorType;
  font?: keyof themeType['font'];
  disabled?: boolean;
  onChange?: (value: StringValue | NumberValue | null) => void;
  options?: Values;
}

type Values = StringValue[] | NumberValue[];
type StringValue = { value: string; label: string };
type NumberValue = { value: number; label: string };

function SelectOne({ onChange, ...props }: SelectOneProps) {
  // manage internal state of selected values
  const [internalState, _setInternalState] = useState(props.value || null);
  const setInternalState = (newState: StringValue | NumberValue | null) => {
    _setInternalState(newState);
    onChange?.(newState);
  };

  // keep internal state in sync with changes made by parent
  if (props.value && JSON.stringify(props.value) !== JSON.stringify(internalState)) {
    _setInternalState(props.value);
  }

  // handle state for String type
  const [textValue, setTextValue] = useState<string>('');
  const addTextValueToInternalState = () => {
    if (textValue !== '') {
      setInternalState({ value: textValue, label: textValue });
      setTextValue('');
    }
  };

  // handle state for number type
  const [numberValue, setNumberValue] = useState<number>();
  const addNumberValueToInternalState = () => {
    if (numberValue) {
      setInternalState({ value: numberValue, label: `${numberValue}` });
      setTextValue('');
    }
  };

  if (props.options) {
    return (
      <Field
        label={props.label}
        description={props.description}
        color={props.color}
        font={props.font}
        isEmbedded={props.isEmbedded}
      >
        <div style={{ position: 'relative' }}>
          <Combobox
            label={props.label}
            description={props.description}
            disabled={props.disabled}
            options={props.options}
            values={internalState ? ([internalState] as StringValue[] | NumberValue[]) : []}
            many={false}
            color={props.color}
            font={props.font}
            onChange={(values) => setInternalState(values[0])}
            showCurrentSelectionInOptions
          />
        </div>
      </Field>
    );
  }

  if (props.type === 'String') {
    return (
      <Field
        label={props.label}
        description={props.description}
        color={props.color}
        font={props.font}
        isEmbedded={props.isEmbedded}
      >
        <div style={{ position: 'relative' }}>
          <Text
            style={{ paddingRight: '42px' }}
            color={props.color}
            font={props.font}
            label={'__in-select'}
            value={textValue}
            onChange={(e) => setTextValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addTextValueToInternalState();
              }
            }}
          />
        </div>
      </Field>
    );
  }

  if (props.type === 'Int' || props.type === 'Float') {
    return (
      <Field
        label={props.label}
        description={props.description}
        color={props.color}
        font={props.font}
        isEmbedded={props.isEmbedded}
      >
        <div style={{ position: 'relative' }}>
          <Number
            style={{ paddingRight: '42px' }}
            type={props.type}
            color={props.color}
            font={props.font}
            label={'__in-select'}
            value={textValue}
            onChange={(e) => setNumberValue(e.currentTarget.valueAsNumber)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addNumberValueToInternalState();
              }
            }}
          />
        </div>
      </Field>
    );
  }

  return <div>oops!</div>;
}

export { SelectOne };
