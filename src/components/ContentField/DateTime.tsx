import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { colorType, themeType } from '../../utils/theme/theme';
import { DateTimePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';
import { Field, FieldProps } from './Field';

interface DateTimeProps extends Omit<FieldProps, 'children'> {
  value: string | null;
  onChange: (date: MaterialUiPickersDate) => void;
  disabled?: boolean;
  placeholder?: string;
}

function DateTime(props: DateTimeProps) {
  const theme = useTheme() as themeType;
  return (
    <Field
      label={props.label}
      description={props.description}
      color={props.color}
      font={props.font}
      isEmbedded={props.isEmbedded}
    >
      <DateTimeComponent
        id={props.label.replaceAll(' ', '-')}
        value={props.value}
        onChange={props.onChange}
        theme={theme}
        disabled={props.disabled}
        placeholder={props.placeholder}
        themeColor={props.color}
      />
    </Field>
  );
}

const DateTimeComponent = styled(DateTimePicker)<{
  theme: themeType;
  themeColor?: colorType;
  disabled?: boolean;
}>`
  padding: 10px 8px !important;
  line-height: 1.2;
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus-within {
    outline: none;
    box-shadow: ${({ theme, themeColor: color }) => {
        if (color === 'neutral') color = undefined;
        return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
      }}
      0px 0px 0px 2px inset;
  }
  .MuiInputBase-root.MuiInput-underline {
    &::before,
    &::after {
      content: none;
    }
  }
  .MuiInputBase-input.MuiInput-input {
    color: ${({ theme, disabled }) => theme.color.neutral[theme.mode][disabled ? 800 : 1400]};
    font-family: ${({ theme }) => theme.font['detail']};
    font-size: 14px;
    font-variant-numeric: lining-nums;
    padding: 0;
    &::placeholder {
      opacity: 0.6;
      font-weight: 500;
    }
  }
`;

export { DateTime };
