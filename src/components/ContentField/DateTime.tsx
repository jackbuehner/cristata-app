import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { DatePicker } from 'antd';
import { DateTime as Luxon } from 'luxon';
import moment from 'moment';
import { colorType, themeType } from '../../utils/theme/theme';
import { Field, FieldProps } from './Field';
import 'antd/dist/antd.css';
import FluentIcon from '../FluentIcon';
import { formatISODate } from '../../utils/formatISODate';

interface DateTimeProps extends Omit<FieldProps, 'children'> {
  value: string | null;
  onChange: (date: Luxon | null) => void;
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
        value={moment(props.value)}
        onChange={(date) => {
          if (date) {
            props.onChange(Luxon.fromISO(date.toISOString()));
          } else {
            props.onChange(null);
          }
        }}
        showTime
        theme={theme}
        disabled={props.disabled}
        placeholder={props.placeholder}
        showSecond={false}
        use12Hours={true}
        themeColor={props.color}
        suffixIcon={<FluentIcon name={'CalendarLtr20Regular'} />}
        clearIcon={<FluentIcon name={'Dismiss20Regular'} />}
        format={(moment) => formatISODate(moment.toISOString(), false, true, true)}
      />
    </Field>
  );
}

const DateTimeComponent = styled(DatePicker)<{
  theme: themeType;
  themeColor?: colorType;
  disabled?: boolean;
}>`
  padding: 8px 8px !important;
  line-height: 1.2 !important;
  width: 100% !important;
  box-sizing: border-box !important;
  border-radius: ${({ theme }) => theme.radius} !important;
  border: none !important;
  box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][400]} 0px 0px 0px 1px inset !important;
  transition: box-shadow 240ms !important;
  background: none !important;
  &:hover {
    box-shadow: ${({ theme }) => theme.color.neutral[theme.mode][1000]} 0px 0px 0px 1px inset !important;
  }
  &:focus-within {
    outline: none !important;
    box-shadow: ${({ theme, themeColor: color }) => {
        if (color === 'neutral') color = undefined;
        return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
      }}
      0px 0px 0px 2px inset !important;
  }

  > .ant-picker-input > input {
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

  > .ant-picker-input > span > svg {
    color: ${({ theme, disabled }) => theme.color.neutral[theme.mode][disabled ? 800 : 1000]};
    background-color: ${({ theme }) => (theme.mode === 'dark' ? theme.color.neutral.dark[100] : 'white')};
    &[name='Dismiss20Regular'] {
      display: none;
    }
  }
`;

export { DateTime };
