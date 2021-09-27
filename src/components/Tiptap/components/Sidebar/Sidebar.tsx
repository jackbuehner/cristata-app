import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { themeType } from '../../../../utils/theme/theme';
import { SidebarHeader } from './SidebarHeader';

interface I_SIDEBAR {
  theme: themeType;
  isOpen: boolean;
}

const SIDEBAR = styled.div<I_SIDEBAR>`
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  width: ${({ isOpen }) => (isOpen ? 330 : 0)}px;
  height: 100%;
  flex-shrink: 0;
  border-left: 1px solid ${({ theme, isOpen }) =>
    isOpen ? theme.color.neutral[theme.mode][500] : 'transparent'};
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s, opacity 40ms ease;
  overflow-x: hidden;
  overflow-y: hidden;
  positon: relative;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
`;

const Container = styled.div`
  overflow-y: auto;
  height: calc(100% - 42px);
  width: 100%;
  > div {
    padding: 12px;
  }
`;

interface ISidebar {
  closeFunction?: () => void;
  isOpen: boolean;
  children?: React.ReactNode;
  header: string;
}

function Sidebar(props: ISidebar) {
  const theme = useTheme() as themeType;

  return (
    <SIDEBAR theme={theme} isOpen={props.isOpen}>
      <SidebarHeader closeFunction={props.closeFunction}>
        {props.header}
      </SidebarHeader>
      <Container>
        <div>{props.children}</div>
      </Container>
    </SIDEBAR>
  );
}

export { Sidebar };
