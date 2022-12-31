import React, { useState } from 'react';
import { DropdownContext } from './_DropdownContext';
import { DropdownPortal } from './_DropdownPortal';

interface IDropdownProvider {
  children: React.ReactNode;
}

function DropdownProvider({ children }: IDropdownProvider) {
  const [Dropdown, setDropdown] = useState<React.ReactElement>(<div></div>);
  const [isOpen, setIsOpen] = useState(false);
  const [hideOnClick, setHideOnClick] = useState(true);
  const [hideOnScroll, setHideOnScroll] = useState(true);

  return (
    <DropdownContext.Provider value={{ setDropdown, isOpen, setIsOpen, setHideOnClick, setHideOnScroll }}>
      {children}
      <DropdownPortal
        Dropdown={Dropdown}
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        hideOnClick={hideOnClick}
        hideOnScroll={hideOnScroll}
      />
    </DropdownContext.Provider>
  );
}

export { DropdownProvider, DropdownContext };
