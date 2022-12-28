import { themeType } from '../../../../utils/theme/theme';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

interface IWidgetLabel
  extends Partial<React.PropsWithChildren<{}>>,
    React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
  isVisible?: boolean;
  draggable?: boolean;
}

function WidgetLabel({ isVisible, draggable, ...props }: IWidgetLabel) {
  const theme = useTheme() as themeType;

  return (
    <WidgetLabelComponent
      {...props}
      theme={theme}
      isVisible={isVisible !== undefined ? isVisible : true}
      draggable={draggable !== undefined ? draggable : false}
    />
  );
}

interface IWidgetLabelComponent {
  theme: themeType;
  isVisible: boolean;
  draggable: boolean;
}

const WidgetLabelComponent = styled.div<IWidgetLabelComponent>`
  width: fit-content;
  background: ${({ theme }) => (theme.mode === 'light' ? '#ffffff' : theme.color.neutral.dark[300])};
  color: ${({ theme }) => theme.color.neutral[theme.mode][1400]};
  position: absolute;
  top: -18px;
  left: 10px;
  border: ${({ theme }) => `1px solid ${theme.color.neutral[theme.mode][200]}`};
  border-radius: ${({ theme }) => theme.radius};
  box-sizing: border-box;
  display: flex;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: opacity 120ms ease-out;
  flex-direction: row;
  align-items: center;
  padding: 1px 10px;
  font-size: 14px;
  font-weight: 700;
  font-family: ${({ theme }) => theme.font.detail};
  user-select: none;
  cursor: ${({ draggable }) => (draggable ? 'grab' : 'default')};
`;

export { WidgetLabel };
