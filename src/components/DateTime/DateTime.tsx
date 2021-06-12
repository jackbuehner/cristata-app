import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../utils/theme/theme';
import { DateTimePicker } from '@material-ui/pickers';
import { MaterialUiPickersDate } from '@material-ui/pickers/typings/date';

interface DateTimeI {
  value: string | null;
  onChange: (date: MaterialUiPickersDate) => void;
  isDisabled?: boolean;
}

interface DateTimeComponentI extends DateTimeI {
  theme: themeType;
}

const DateTimeComponent = styled(DateTimePicker)<DateTimeComponentI>`
  padding: 8px !important;
  line-height: 1.2;
  width: 100%;
  box-sizing: border-box;
  border-radius: ${({ theme }) => theme.radius};
  border: none;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][800]} 0px 0px 0px 1px inset;
  transition: box-shadow 240ms;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset;
  }
  &:focus-within {
    outline: none;
    box-shadow: ${({ theme }) => theme.color.primary[800]} 0px 0px 0px 2px inset;
  }
  .MuiInputBase-root.MuiInput-underline {
    &::before,
    &::after {
      content: none;
    }
  }
  .MuiInputBase-input.MuiInput-input {
    font-family: ${({ theme }) => theme.font['detail']};
    font-size: 14px;
    font-variant-numeric: lining-nums;
    padding: 0;
  }
`;

function DateTime(props: DateTimeI) {
  const theme = useTheme() as themeType;
  return (
    <DateTimeComponent
      value={props.value}
      onChange={props.onChange}
      theme={theme}
      disabled={props.isDisabled}
    />
  );
}

export { DateTime };
