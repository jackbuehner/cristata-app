/** @jsxImportSource @emotion/react */
import { css, SerializedStyles, useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../../../utils/theme/theme';
import { Button } from '../../../Button';
import { ButtonProps } from '../../../Button/Button';
import { ToolbarRowButton } from './ToolbarRowButton';

interface ICombobox extends ButtonProps {
  width: string;
  cssContainerExtra?: SerializedStyles;
}

function Combobox(props: ICombobox) {
  const theme = useTheme() as themeType;
  const Box = styled(Button)<{ theme: themeType; width: string }>`
    background-color: ${({ theme }) =>
      theme.mode === 'light' ? 'white' : 'black'};
    height: 28px;
    min-width: 40px;
    box-shadow: none !important;
    border: 1px solid ${({ theme }) =>
      theme.color.neutral[theme.mode][800]} !important;
    width: ${({ width }) => width};
    justify-content: left;
  `;
  return (
    <ToolbarRowButton
      {...props}
      onClick={undefined}
      isActive={false}
      theme={theme}
      cssExtra={css`
        background: none !important;
        box-shadow: none !important;
        border: none !important;
        ${props.cssContainerExtra}
      `}
    >
      <Box
        {...props}
        theme={theme}
        cssExtra={css`
          overflow: hidden;
          ${props.cssExtra}
        `}
      ></Box>
    </ToolbarRowButton>
  );
}

export { Combobox };
