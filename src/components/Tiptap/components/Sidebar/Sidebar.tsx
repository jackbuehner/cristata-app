import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Editor } from '@tiptap/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { themeType } from '../../../../utils/theme/theme';
import { SidebarHeader } from './SidebarHeader';
import { Children, cloneElement } from 'react';
import { useAwareness } from '../../hooks';
import { EntryY } from '../../hooks/useY';

interface I_SIDEBAR {
  theme: themeType;
  isOpen: boolean;
}

const SIDEBAR = styled.div<I_SIDEBAR>`
  background-color: ${({ theme }) => theme.color.neutral[theme.mode][100]};
  width: ${({ isOpen }) => (isOpen ? 330 : 0)}px;
  height: 100%;
  flex-shrink: 0;
  border-left: 1px solid
    ${({ theme, isOpen }) =>
      isOpen ? theme.color.neutral[theme.mode][theme.mode === 'light' ? 400 : 200] : 'transparent'};
  transition: width 160ms cubic-bezier(0.165, 0.84, 0.44, 1) 0s, opacity 40ms ease;
  overflow-x: hidden;
  overflow-y: hidden;
  positon: relative;
  opacity: ${({ isOpen }) => (isOpen ? 1 : 0)};
`;

const Container = styled.div`
  overflow-y: auto;
  scroll-behavior: smooth;
  height: calc(100% - 42px);
  width: 100%;
  > div {
    padding: 12px;
    height: 100%;
    box-sizing: border-box;
  }
`;

interface ISidebar {
  closeFunction?: (params: URLSearchParams) => void;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  children?: React.ReactElement;
  header: string;
  setHeader: React.Dispatch<React.SetStateAction<string>>;
  editor: Editor | null;
  y: EntryY;
  user: ReturnType<typeof useAwareness>[0];
}

function Sidebar(props: ISidebar) {
  const theme = useTheme() as themeType;
  const { pathname, search, hash } = useLocation();
  const navigate = useNavigate();

  const closeFunction = () => {
    const params = new URLSearchParams(search);
    props.closeFunction?.(params);
    props.setIsOpen(false);
    props.setHeader('');
    navigate(pathname + '?' + params.toString() + hash, { replace: true });
  };

  return (
    <SIDEBAR theme={theme} isOpen={props.isOpen}>
      <SidebarHeader closeFunction={closeFunction}>{props.header}</SidebarHeader>
      <Container>
        <div>
          {props.children
            ? Children.map(props.children, (child) => {
                return cloneElement(child, {
                  editor: props.editor,
                  user: props.user,
                  y: props.y,
                });
              })
            : null}
        </div>
      </Container>
    </SIDEBAR>
  );
}

export { Sidebar };
