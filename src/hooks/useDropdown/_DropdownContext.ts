import { createContext } from 'react';

interface IDropdownContext {
  setDropdown: React.Dispatch<React.SetStateAction<React.ReactElement>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  setHideOnClick: React.Dispatch<React.SetStateAction<boolean>>;
  setHideOnScroll: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = createContext<IDropdownContext | undefined>(undefined);

export { DropdownContext };
