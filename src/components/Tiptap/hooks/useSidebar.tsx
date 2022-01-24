import { Dispatch, SetStateAction, useState } from 'react';

/**
 * Manages state for the sidebar. Manage whether it is open and control the
 * title and content.
 */
function useSidebar(props?: SidebarProps): ReturnType {
  // manage whether sidebar is open
  const [isOpen, setIsOpen] = useState<boolean>(props?.defaults?.isOpen || false);

  // manage the content of the sidebar
  const [content, setContent] = useState<React.ReactNode>(props?.defaults?.content || <p>Sidebar content</p>);

  // manage the sidebar title
  const [title, setTitle] = useState<string>(props?.defaults?.title || 'Sidebar title');

  return [
    { isOpen, content, title },
    { setIsOpen, setContent, setTitle },
  ];
}

interface SidebarProps {
  defaults?: {
    isOpen?: boolean;
    title?: string;
    content?: React.ReactNode;
  };
}

type ReturnType = [
  { isOpen: boolean; content: React.ReactNode; title: string },
  {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    setContent: Dispatch<SetStateAction<React.ReactNode>>;
    setTitle: Dispatch<SetStateAction<string>>;
  }
];

export { useSidebar };
