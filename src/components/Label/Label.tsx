import { useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { themeType } from '../../utils/theme/theme';

const LabelComponent = styled.div<{
  theme: themeType;
  hasDescription: boolean;
  disabled?: boolean;
}>`
  font-family: ${({ theme }) => theme.font.headline};
  font-size: 15px;
  font-weight: 600;
  margin: ${({ hasDescription }) => (hasDescription ? `0` : `0 0 4px 0`)};
  display: block;
  color: ${({ disabled, theme }) =>
    disabled ? theme.color.neutral[theme.mode][800] : theme.color.neutral[theme.mode][1400]};
`;

const DescriptionComponent = styled.div<{
  theme: themeType;
  disabled?: boolean;
}>`
  font-family: ${({ theme }) => theme.font.detail};
  font-size: 13px;
  font-weight: 400;
  margin: 0 0 4px 0;
  display: block;
  white-space: pre-line;
  color: ${({ disabled, theme }) =>
    disabled ? theme.color.neutral[theme.mode][600] : theme.color.neutral[theme.mode][1200]};
  a {
    color: ${({ disabled, theme }) =>
      disabled
        ? theme.color.neutral[theme.mode][600]
        : theme.color.primary[theme.mode === 'light' ? 800 : 300]};
  }
`;

interface ILabel {
  htmlFor?: string;
  description?: string;
  children?: React.ReactChild;
  disabled?: boolean;
}

function Label(props: ILabel) {
  const theme = useTheme() as themeType;
  return (
    <label htmlFor={props.htmlFor}>
      <LabelComponent theme={theme} hasDescription={!!props.description} disabled={props.disabled}>
        {props.children}
      </LabelComponent>
      <DescriptionComponent
        theme={theme}
        disabled={props.disabled}
        dangerouslySetInnerHTML={props.description ? { __html: props.description } : { __html: '' }}
      ></DescriptionComponent>
    </label>
  );
}

export { Label };
