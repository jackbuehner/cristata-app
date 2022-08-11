import { InputHTMLAttributes } from 'react';
import { CollaborativeFieldProps } from '.';
import { Field } from '../ContentField/Field';
import { CollaborativeCombobox, Value, Values } from './CollaborativeCombobox';

interface CollaborativeSelectOneProps
  extends CollaborativeFieldProps,
    Omit<Omit<Omit<Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, 'onChange'>, 'color'>, 'checked'> {
  initialValue?: Value<string>;
  onChange?: (value: Value<string>) => void;
  options: Values<string>;
  noDrag?: boolean;
  number?: 'integer' | 'decimal';
}

function CollaborativeSelectOne(props: CollaborativeSelectOneProps) {
  const { y, defaultValue, onChange, ...labelProps } = props;

  const Content = (
    <div style={{ position: 'relative' }}>
      <CollaborativeCombobox
        y={props.y}
        disabled={props.disabled}
        options={props.options}
        initialValues={props.initialValue ? [props.initialValue] : []}
        many={false}
        color={props.color}
        font={props.font}
        onChange={(values) => {
          props.onChange?.(values[0]);
        }}
      />
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

export { CollaborativeSelectOne };
