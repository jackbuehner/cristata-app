import React, { useState } from 'react';
import { DropdownContext } from './_DropdownContext';
import { DropdownPortal } from './_DropdownPortal';

interface IDropdownProvider {
  children: React.ReactNode;
}

function DropdownProvider({ children }: IDropdownProvider) {
  const [Dropdown, setDropdown] = useState<React.ReactElement>(<div></div>);
  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <DropdownContext.Provider value={{ setDropdown, isOpen, setIsOpen }}>
      {children}
      <DropdownPortal Dropdown={Dropdown} isOpen={isOpen} />
    </DropdownContext.Provider>
  );
}

export { DropdownProvider, DropdownContext };
