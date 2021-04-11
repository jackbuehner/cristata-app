import React, { useCallback, useState } from 'react';
import { DropdownContext } from './_DropdownContext';
import { DropdownPortal } from './_DropdownPortal';

interface IDropdownProvider {
  children: React.ReactNode;
}

function DropdownProvider({ children }: IDropdownProvider) {
  const [Dropdown, setDropdown] = useState<React.FunctionComponent>();
  const [isOpen, setIsOpen] = useState<boolean>(false);

  const [dropdownChildren, setDropdownChildren] = useState<HTMLCollection>();

  const measuredRef = useCallback((node) => {
    if (node !== null) {
      setDropdownChildren(node.children);
    }
  }, []);

  return (
    <DropdownContext.Provider value={{ setDropdown, isOpen, setIsOpen, dropdownChildren }}>
      {children}
      <DropdownPortal ref={measuredRef} Dropdown={Dropdown} isOpen={isOpen} />
    </DropdownContext.Provider>
  );
}

export { DropdownProvider, DropdownContext };
