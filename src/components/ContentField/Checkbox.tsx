import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import type { CSSProperties, InputHTMLAttributes } from 'react';
import type { colorType, themeType } from '../../utils/theme/theme';
import type { FieldProps } from './Field';
import { Field } from './Field';

interface CheckboxProps
  extends Omit<FieldProps, 'children'>,
    Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  color?: colorType;
  font?: keyof themeType['font'];
  style?: CSSProperties;
}

function Checkbox(props: CheckboxProps) {
  const theme = useTheme() as themeType;

  return (
    <Field
      label={props.label}
      description={props.description}
      color={props.color}
      font={props.font}
      isEmbedded={props.isEmbedded}
      style={{
        display: 'flex',
        flexDirection: 'row-reverse',
        gap: 10,
        alignItems: 'flex-start',
        paddingTop: 10,
        ...props.style,
      }}
      labelRowStyle={{ flexGrow: 1 }}
      labelStyle={props.description ? undefined : { marginBottom: 0 }}
      childWrapperStyle={{ display: 'flex' }}
    >
      <CheckboxComponent {...props} theme={theme} type={'checkbox'} id={props.label.replaceAll(' ', '-')} />
    </Field>
  );
}

const CheckboxComponent = styled.input<{ theme: themeType; color?: colorType }>`
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

export { Checkbox };
