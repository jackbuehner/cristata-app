import { createContext } from 'react';

interface IDropdownContext {
  setDropdown: React.Dispatch<React.SetStateAction<React.FunctionComponent<{}> | undefined>>;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isOpen: boolean;
  dropdownChildren: HTMLCollection | undefined;
}

const DropdownContext = createContext<IDropdownContext | undefined>(undefined);

export { DropdownContext };
