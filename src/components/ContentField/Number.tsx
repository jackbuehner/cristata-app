import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { InputHTMLAttributes } from 'react';
import { colorType, themeType } from '../../utils/theme/theme';
import { Field, FieldProps } from './Field';

interface NumberProps extends Omit<FieldProps, 'children'>, InputHTMLAttributes<HTMLInputElement> {
  type: 'Float' | 'Int';
  color?: colorType;
  font?: keyof themeType['font'];
}

function Number(props: NumberProps) {
  const theme = useTheme() as themeType;

  return (
    <Field
      label={props.label}
      description={props.description}
      color={props.color}
      font={props.font}
      isEmbedded={props.isEmbedded}
    >
      <NumberInputComponent
        {...props}
        id={props.label.replaceAll(' ', '-')}
        type={'number'}
        theme={theme}
        draggable={false}
        onKeyDown={(e) => {
          // prevent decimals if type === 'Int'
          if (props.type === 'Int') {
            if (e.key === '.') {
              e.preventDefault();
            }
          }
          // prevent + and -
          if (e.key === '+' || e.key === '-') {
            e.preventDefault();
          }
        }}
        onBlur={(e) => {
          // strip decimals if type === 'Int'
          if (props.type === 'Int') {
            e.target.value = e.target.value.replaceAll('.', '') || '';
          }
          props.onBlur?.(e);
        }}
        onChange={(e) => {
          // strip decimals if type === 'Int'
          if (props.type === 'Int') {
            e.target.value = e.target.value.replaceAll('.', '') || '';
          }
          props.onChange?.(e);
        }}
      />
    </Field>
  );
}

const NumberInputComponent = styled.input<{
  theme: themeType;
  color?: colorType;
  font?: keyof themeType['font'];
}>`
  resize: none;
  padding: 10px 8px;
  line-height: 16px;
  background-color: transparent;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  appearance: none; /* override native appearance (safari fix) */
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 14px;
  font-variant-numeric: lining-nums;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus {
    outline: none;
    box-shadow: ${({ theme, color }) => {
        if (color === 'neutral') color = undefined;
        return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
      }}
      0px 0px 0px 2px inset;
  }
`;

export { Number };
