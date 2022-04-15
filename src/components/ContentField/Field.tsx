import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { CSSProperties } from 'react';
import { colorType, themeType } from '../../utils/theme/theme';
import { sanitize } from 'dompurify';

interface FieldProps {
  children: React.ReactElement;
  label: string;
  description?: string;
  color?: colorType;
  font?: keyof themeType['font'];
  isEmbedded?: boolean;
  style?: CSSProperties;
  labelRowStyle?: CSSProperties;
  labelStyle?: CSSProperties;
  childWrapperStyle?: CSSProperties;
  disabled?: boolean;
}

function Field(props: FieldProps) {
  const theme = useTheme() as themeType;

  return (
    <FieldComponent
      theme={theme}
      isInSelect={props.label === '__in-select' || props.label === '__in-combobox'}
      isEmbedded={props.isEmbedded}
      style={props.style}
    >
      {props.label !== '__in-select' && props.label !== '__in-combobox' ? (
        <>
          <LabelRow theme={theme} style={props.labelRowStyle}>
            <Label
              theme={theme}
              font={props.font}
              style={props.labelStyle}
              htmlFor={props.label.replaceAll(' ', '-')}
            >
              {props.label}
            </Label>
          </LabelRow>
          {props.description ? (
            <Description
              theme={theme}
              dangerouslySetInnerHTML={{ __html: sanitize(props.description) }}
              disabled={props.disabled || false}
            />
          ) : null}
        </>
      ) : null}
      <div style={props.childWrapperStyle}>{props.children}</div>
    </FieldComponent>
  );
}

const FieldComponent = styled.div<{
  theme: themeType;
  color?: colorType;
  isInSelect: boolean;
  isEmbedded?: boolean;
}>`
  padding: ${({ isInSelect, isEmbedded }) => (isInSelect ? `0` : `2px 0 12px ${isEmbedded ? '0' : '20px'}`)};
  margin: ${({ isInSelect, isEmbedded }) => (isInSelect ? `0` : `0 0 ${isEmbedded ? '0' : '16px'} 0`)};
  border-left: ${({ isInSelect, isEmbedded }) => (isInSelect || isEmbedded ? `0` : `2px`)} solid;
  border-left-color: ${({ theme }) => theme.color.neutral[theme.mode][300]};
  transition: border-left-color 240ms;
  &:focus-within {
    border-left-color: ${({ theme, color }) => {
      if (color === 'neutral') color = undefined;
      return theme.color[color || 'primary'][theme.mode === 'dark' ? 300 : 800];
    }};
  }
`;

const Label = styled.label<{ theme: themeType; font?: keyof themeType['font'] }>`
  line-height: 20px;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  font-weight: 500;
  color: ${({ theme }) => theme.color.neutral[theme.mode][1200]};
  margin: 0 0 10px 0;
  user-select: none;
`;

const Description = styled.div<{ theme: themeType; font?: keyof themeType['font']; disabled: boolean }>`
  line-height: 16px;
  font-family: ${({ theme, font }) => theme.font[font ? font : 'detail']};
  font-size: 13px;
  font-variant-numeric: lining-nums;
  font-weight: 400;
  color: ${({ disabled, theme }) =>
    disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1100]};
  a {
    color: ${({ disabled, theme }) =>
      disabled
        ? theme.color.neutral[theme.mode][600]
        : theme.color.primary[theme.mode === 'light' ? 800 : 300]};
  }
  margin: -6px 0 14px 0;
  white-space: pre-line;
`;

const LabelRow = styled.div<{ theme: themeType }>`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

export type { FieldProps };
export { Field };