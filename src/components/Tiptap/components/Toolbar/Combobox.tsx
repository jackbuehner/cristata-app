/** @jsxImportSource @emotion/react */
import { css, SerializedStyles, useTheme } from '@emotion/react';
import styled from '@emotion/styled/macro';
import { ChevronDown12Regular } from '@fluentui/react-icons';
import { colorType, themeType } from '../../../../utils/theme/theme';
import { Button } from '../../../Button';
import { ButtonProps } from '../../../Button/Button';
import { ToolbarRowButton } from './ToolbarRowButton';

interface ICombobox extends ButtonProps {
  width: string;
  cssContainerExtra?: SerializedStyles;
  color: colorType;
}

function Combobox(props: ICombobox) {
  const theme = useTheme() as themeType;
  const Box = styled(Button)<{
    theme: themeType;
    width: string;
    side: 'left' | 'right';
  }>`
    background-color: ${({ theme }) => (theme.mode === 'light' ? 'white' : 'black')};
    height: 28px;
    min-width: 40px;
    box-shadow: none !important;
    border-color: ${({ theme }) => theme.color.neutral[theme.mode][800]} !important;
    border-width: 1px;
    border-left-width: ${({ side }) => (side === 'right' ? 0 : 1)}px !important;
    border-radius: 0 !important;
    border-right-width: ${({ side }) => (side === 'left' ? 0 : 1)}px !important;
    width: ${({ width }) => width};
    justify-content: left;
    ${({ side }) =>
      side === 'right'
        ? `
            padding: 2px;
            min-width: 16px;
          `
        : null}
  `;
  return (
    <ToolbarRowButton
      onClick={undefined}
      isActive={false}
      cssExtra={css`
        background: none !important;
        box-shadow: none !important;
        border: none !important;
        ${props.cssContainerExtra}
      `}
    >
      <WrapperButton onClick={props.onClick} disabled={props.disabled}>
        <Box
          width={props.width}
          children={props.children}
          theme={theme}
          color={props.color}
          side={'left'}
          disabled={props.disabled}
          cssExtra={css`
            overflow: hidden;
            ${props.cssExtra}
          `}
        />
        <Box width={'16px'} theme={theme} color={props.color} side={'right'} disabled={props.disabled}>
          <ChevronDown12Regular />
        </Box>
      </WrapperButton>
    </ToolbarRowButton>
  );
}

const WrapperButton = styled.button`
  all: unset;
  display: flex;
  flex-direction: row;
`;

export { Combobox };
