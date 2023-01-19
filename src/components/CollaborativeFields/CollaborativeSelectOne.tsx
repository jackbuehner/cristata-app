import { InputHTMLAttributes } from 'react';
import { CollaborativeFieldProps, CollaborativeFieldWrapper } from './';
import { CollaborativeCombobox, Value, Values } from './CollaborativeCombobox';

interface CollaborativeSelectOneProps
  extends CollaborativeFieldProps,
    Omit<Omit<Omit<Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, 'onChange'>, 'color'>, 'checked'> {
  onChange?: (value: Value<string>) => void;
  options: Values<string>;
  noDrag?: boolean;
  number?: 'integer' | 'decimal';
  showCurrentSelectionInOptions?: boolean;
}

function CollaborativeSelectOne(props: CollaborativeSelectOneProps) {
  const { y, onChange, ...labelProps } = props;

  const Content = (
    <div style={{ position: 'relative' }}>
      <CollaborativeCombobox
        y={props.y}
        disabled={props.disabled}
        options={props.options}
        many={false}
        color={props.color}
        font={props.font}
        onChange={(values) => {
          props.onChange?.(values[0]);
        }}
        showCurrentSelectionInOptions={props.showCurrentSelectionInOptions}
      />
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

export { CollaborativeSelectOne };
