import { css, Global, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { CalendarLtr20Regular, Dismiss20Regular } from '@fluentui/react-icons';
import { DatePicker } from 'antd';
import 'antd/lib/date-picker/style/index.css';
import { DateTime as Luxon } from 'luxon';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { YTextEvent } from 'yjs';
import { CollaborativeFieldProps, CollaborativeFieldWrapper } from '.';
import { formatISODate } from '../../utils/formatISODate';
import { colorType, themeType } from '../../utils/theme/theme';
import { buttonEffect } from '../Button';

interface CollaborativeDateTimeProps extends CollaborativeFieldProps {
  onChange?: (date: Luxon | null) => void;
  placeholder?: string;
}

function CollaborativeDateTime(props: CollaborativeDateTimeProps) {
  const { y, onChange, placeholder, ...labelProps } = props;
  const yText = y.ydoc?.getText(y.field);

  // keep track of the iso date in the shared type
  const [value, setValue] = useState(yText?.toJSON() || '');
  useEffect(() => {
    if (yText) {
      if (value !== yText.toJSON()) {
        setValue(yText.toJSON());
      }

      const handleChange = (evt: YTextEvent) => {
        const text = evt.target.toJSON();
        setValue(text);

        // send changes to parent
        onChange?.(Luxon.fromISO(text));
      };

      yText.observe(handleChange);
      return () => {
        yText.unobserve(handleChange);
      };
    }
  }, [onChange, value, yText]);

  const theme = useTheme() as themeType;

  const Content = (
    <>
      <CollaborativeDateTimeComponent
        value={value ? moment(value) : undefined}
        onChange={(date) => {
          if (yText) {
            yText.delete(0, yText.toJSON().length);
            yText.insert(0, date?.toISOString() || '');
          }
        }}
        showTime
        disabled={props.disabled}
        placeholder={props.placeholder}
        use12Hours={true}
        themeColor={props.color}
        suffixIcon={<CalendarLtr20Regular />}
        clearIcon={<Dismiss20Regular />}
        format={(moment) => formatISODate(moment.toISOString(), false, true, true)}
      />
      <Global styles={antPickerStyles(theme, props.color)} />
    </>
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

const CollaborativeDateTimeComponent = styled(DatePicker)<{
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

  > .ant-picker-input > input,
  > .ant-picker-input > input[disabled] {
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

const antPickerStyles = (theme: themeType, color: colorType | undefined) => css`
  .ant-slide-up-leave-active {
    display: none;
  }

  .ant-picker-dropdown {
    .ant-picker-panel-container {
      .ant-picker-panel {
        background-color: ${theme.mode === 'light' ? 'white' : theme.color.neutral.dark[200]};
        border: none;
      }
      .ant-picker-panel,
      .ant-picker-header,
      .ant-picker-content th,
      .ant-picker-cell-in-view,
      .ant-picker-time-panel-column > li.ant-picker-time-panel-cell .ant-picker-time-panel-cell-inner {
        color: ${theme.color.neutral[theme.mode][1400]};
        font-family: ${theme.font.detail};
      }
      .ant-picker-cell:not(.ant-picker-cell-in-view) {
        color: ${theme.color.neutral[theme.mode][900]};
        font-family: ${theme.font.detail};
      }
      .ant-picker-header {
        gap: 4px;
        border-bottom: 1px solid ${theme.color.neutral[theme.mode][300]} !important;
        > button {
          height: 32px;
          width: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 4px;
          border-radius: ${theme.radius};
          color: ${theme.color.neutral[theme.mode][1000]};
          ${buttonEffect(
            color || 'primary',
            300,
            theme,
            false,
            { base: 'transparent' },
            { base: '1px solid transparent' }
          )};
        }
      }
      .ant-picker-cell-in-view.ant-picker-cell-today .ant-picker-cell-inner::before {
        border: 2px solid
          ${theme.color[color && color !== 'neutral' ? color : 'primary'][theme.mode === 'light' ? 800 : 300]};
      }
      tr {
        display: flex;
        flex-direction: row;
        td.ant-picker-cell {
          padding: 0;
          display: flex;
          width: 32px;
          height: 32px;
          margin: 2px;
          &::before {
            content: none;
          }
          &.ant-picker-cell-selected {
            > div {
              background-color: ${theme.color[color && color !== 'neutral' ? color : 'primary'][
                theme.mode === 'light' ? 800 : 300
              ]};
              color: ${theme.color.neutral[theme.mode][100]};
            }
          }
          > div {
            padding: 3px;
            border: 1px solid transparent;
            cursor: default;
          }
        }
      }
      .ant-picker-cell:hover:not(.ant-picker-cell-in-view) .ant-picker-cell-inner,
      .ant-picker-cell:hover:not(.ant-picker-cell-selected):not(.ant-picker-cell-range-start):not(.ant-picker-cell-range-end):not(.ant-picker-cell-range-hover-start):not(.ant-picker-cell-range-hover-end)
        .ant-picker-cell-inner {
        ${buttonEffect(
          color || 'primary',
          theme.mode === 'light' ? 800 : 300,
          theme,
          false,
          { base: 'transparent' },
          { base: '1px solid transparent' }
        )};
      }
      .ant-picker-time-panel,
      .ant-picker-time-panel-column:not(:first-of-type) {
        border-left: 1px solid ${theme.color.neutral[theme.mode][300]} !important;
      }
      .ant-picker-time-panel-cell {
        border-radius: ${theme.radius};
        height: 30px;
        margin-top: 4px;
        > .ant-picker-time-panel-cell-inner {
          background: none;
          padding: 0 16px;
          height: 30px;
          box-sizing: border-box;
          cursor: default;
          &:hover {
            background: none;
          }
        }
        &.ant-picker-time-panel-cell-selected > .ant-picker-time-panel-cell-inner {
          background-color: ${theme.color[color && color !== 'neutral' ? color : 'primary'][
            theme.mode === 'light' ? 800 : 300
          ]};
          color: ${theme.color.neutral[theme.mode][100]} !important;
          border-radius: ${theme.radius};
        }
        ${buttonEffect(
          color || 'primary',
          theme.mode === 'light' ? 800 : 300,
          theme,
          false,
          { base: 'transparent' },
          { base: '1px solid transparent' }
        )};
      }
    }
    .ant-picker-footer {
      border-top: 1px solid ${theme.color.neutral[theme.mode][300]} !important;
      button {
        height: 30px;
        width: 80px;
        color: ${theme.color.neutral[theme.mode][1400]};
        border-radius: ${theme.radius};
        font-family: ${theme.font.detail};
        ${buttonEffect(color || 'primary', theme.mode === 'light' ? 800 : 300, theme)};
      }
      a.ant-picker-now-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 30px;
        width: 80px;
        color: ${theme.color.neutral[theme.mode][1400]};
        border-radius: ${theme.radius};
        font-family: ${theme.font.detail};
        ${buttonEffect(color || 'primary', theme.mode === 'light' ? 800 : 300, theme)};
      }
    }
  }
`;

export { CollaborativeDateTime };
