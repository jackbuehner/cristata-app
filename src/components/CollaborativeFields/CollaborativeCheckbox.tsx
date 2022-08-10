import styled from '@emotion/styled/macro';
import { InputHTMLAttributes, useEffect, useState } from 'react';
import { YMapEvent } from 'yjs';
import { CollaborativeFieldProps } from '.';
import { colorType } from '../../utils/theme/theme';
import { Field } from '../ContentField/Field';

interface CollaborativeCheckboxProps
  extends CollaborativeFieldProps,
    Omit<Omit<Omit<Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>, 'onChange'>, 'color'>, 'checked'> {
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
}

function CollaborativeCheckbox(props: CollaborativeCheckboxProps) {
  const { y, defaultValue, onChange, ...labelProps } = props;
  const checkboxFieldsMap = y.ydoc?.getMap<Record<string, boolean>>('__checkboxes');

  // keep track of the checked status in the checkbox field shared type
  const [checked, setChecked] = useState(checkboxFieldsMap?.get(y.field));
  useEffect(() => {
    const handleChange = (evt: YMapEvent<Record<string, boolean>>) => {
      const change = evt.changes.keys.get(y.field);
      if (change) {
        if (change.action === 'delete') setChecked(undefined);
        else setChecked(checkboxFieldsMap?.get(y.field));
      }
    };
    checkboxFieldsMap?.observe(handleChange);
    return () => {
      checkboxFieldsMap?.unobserve(handleChange);
    };
  });

  // create an update function
  const onUpdate = (evt: React.ChangeEvent<HTMLInputElement>) => {
    if (props.onChange && y.ydoc) {
      const checked = evt.currentTarget.checked;

      // store change in ydoc shared type for checkbox fields
      const checkboxFieldsMap = y.ydoc.getMap<Record<string, boolean>>('__checkboxes');
      checkboxFieldsMap.set(y.field, checked);

      // send the change to the parent
      props.onChange(checked);
    }
  };

  // replace the checked value with default checked if the field is empty in the ydoc shared type
  if (props.defaultChecked && checkboxFieldsMap && checked === undefined) {
    checkboxFieldsMap.set(y.field, props.defaultChecked);
  }

  if (props.label) {
    return (
      <Field
        {...labelProps}
        label={props.label}
        style={{
          display: 'flex',
          flexDirection: 'row-reverse',
          gap: 10,
          alignItems: 'flex-start',
          paddingTop: 10,
          ...props.style,
        }}
        labelRowStyle={{ flexGrow: 1, ...props.labelRowStyle }}
        labelStyle={props.description ? props.labelStyle : { marginBottom: 0, ...props.labelStyle }}
        childWrapperStyle={{ display: 'flex', ...props.childWrapperStyle }}
      >
        <CheckboxComponent
          type={'checkbox'}
          id={props.label.replaceAll(' ', '-')}
          color={props.color}
          onChange={onUpdate}
          checked={checked}
        />
      </Field>
    );
  }

  return <CheckboxComponent type={'checkbox'} color={props.color} onChange={onUpdate} checked={checked} />;
}

const CheckboxComponent = styled.input<{ color?: colorType }>`
  height: 18px;
  width: 18px;
  margin: 0;
  border-radius: ${({ theme }) => theme.radius};
  &::before {
    content: '';
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.neutral[theme.mode][800]};
    background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : theme.color.neutral.dark[100])};
    height: 18px;
    width: 18px;
    margin: 0;
    display: block;
    border-radius: ${({ theme }) => theme.radius};
  }
  &:hover::before,
  &:checked:hover::before {
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color.neutral[theme.mode][1000]};
  }
  &:checked:hover::before {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.color.neutral[theme.mode][1500]};
  }
  &:active::before,
  &:checked:active::before {
    box-shadow: inset 0 0 0 2px ${({ theme }) => theme.color.neutral[theme.mode][800]};
    background-color: ${({ theme }) => theme.color.neutral[theme.mode][800]};
  }
  &:checked::before {
    box-shadow: inset 0 0 0 2px
      ${({ theme, color }) => {
        if (color === 'neutral') color = undefined;
        return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
      }};
    background-color: ${({ theme, color }) => {
      if (color === 'neutral') color = undefined;
      return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
    }};
    background-image: ${({ theme }) =>
      theme.mode === 'dark'
        ? `url(data:image/svg+xml;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZpbGw9IiMwMDAwMDAiPjx0aXRsZS8+PGcgaWQ9Imljb21vb24taWdub3JlIi8+PHBhdGggZD0iTTg3My41IDIzMy41bDQ1IDQ1LTUzNC41IDUzNS0yNzguNS0yNzkgNDUtNDUgMjMzLjUgMjMzIDQ4OS41LTQ4OXoiLz48L3N2Zz4=)`
        : `url(data:image/svg+xml;utf8;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDI0IiBoZWlnaHQ9IjEwMjQiIHZpZXdCb3g9IjAgMCAxMDI0IDEwMjQiIGZpbGw9IiNmZmYiPjx0aXRsZS8+PGcgaWQ9Imljb21vb24taWdub3JlIi8+PHBhdGggZD0iTTg3My41IDIzMy41bDQ1IDQ1LTUzNC41IDUzNS0yNzguNS0yNzkgNDUtNDUgMjMzLjUgMjMzIDQ4OS41LTQ4OXoiLz48L3N2Zz4=)`};
    background-size: 18px;
  }
`;

export { CollaborativeCheckbox };
