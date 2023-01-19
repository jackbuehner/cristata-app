import type { Dispatch, SetStateAction } from 'react';
import { useState } from 'react';

/**
 * Manages state for the sidebar. Manage whether it is open and control the
 * title and content.
 */
function useSidebar(props?: SidebarProps): ReturnType {
  // manage whether sidebar is open
  const [isOpen, setIsOpen] = useState<boolean>(props?.defaults?.isOpen || false);

  // manage the content of the sidebar
  const [content, setContent] = useState<React.ReactElement>(
    props?.defaults?.content || <p>Sidebar content</p>
  );

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
    content?: React.ReactElement;
  };
}

type ReturnType = [
  { isOpen: boolean; content: React.ReactElement; title: string },
  {
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    setContent: Dispatch<SetStateAction<React.ReactElement>>;
    setTitle: Dispatch<SetStateAction<string>>;
  }
];

export { useSidebar };
