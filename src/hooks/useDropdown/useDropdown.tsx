import React, { useContext, useEffect, useMemo, useState } from 'react';
import { DropdownContext } from './_DropdownContext';

/**
 * React hook for showing dropdowns.
 * @param component a React fucntional component
 * @param deps (optional) dependencies for the functional component
 * @returns [showDropdown, hideDropdown]
 */
function useDropdown<T extends Record<string, unknown> = Record<string, unknown>>(
  component: (
    triggerRect: DOMRect,
    dropdownRef: (el: HTMLOListElement) => void,
    props: T
  ) => React.ReactElement,
  deps?: any[],
  hideOnClick?: boolean,
  hideOnScroll?: boolean
): [(e: React.MouseEvent<HTMLElement, MouseEvent>, dropdownProps?: T) => void, () => void] {
  const { setDropdown, setIsOpen } = useContext(DropdownContext)!; // end with `!` to tell typescipt that the context is not undefined

  // store the position and size information of the last element that executed `showDropdown()`
  const [triggerRect, setTriggerRect] = useState<DOMRect>(new DOMRect());

  // store the props to provide to the dropdown
  const [dropdownProps, setDropdownProps] = useState<T>({} as T);

  /**
   * Shows the dropdown.
   */
  const showDropdown = (e: React.MouseEvent<HTMLElement, MouseEvent>, dropdownProps?: T) => {
    setTriggerRect(e.currentTarget.getBoundingClientRect());
    if (dropdownProps) setDropdownProps(dropdownProps);
    setIsOpen(true);
  };

  /**
   * Hides the dropdown.
   */
  const hideDropdown = () => {
    setIsOpen(false);
  };

  /**
   * Listen for any click events on the page
   * and close the dropdown if they occur.
   */
  useEffect(() => {
    if (hideOnClick) {
      const closeOnClick = () => {
        hideDropdown();
      };
      document.addEventListener('click', closeOnClick, true);
      return document.removeEventListener('click', closeOnClick);
    }
  });

  /**
   * Callback ref for the dropdown, which is used to focus the dropdown once
   * it appears.
   */
  const dropdownRef = (el: HTMLOListElement) => {
    if (el) {
      el.focus();
    }
  };

  // memoize the dropdown component so that it does not trigger `setDropdown` on every render
  // (only trigger `setDropdown` when `deps` has changed)
  const DropdownComponent = useMemo(
    () => {
      return component(triggerRect, dropdownRef, dropdownProps);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps ? [triggerRect, dropdownProps, ...deps] : [triggerRect]
  );

  // when provided `DropdownComponent` changes, update the dropdown in the dropdown portal
  useEffect(() => {
    setDropdown(DropdownComponent);
  }, [DropdownComponent, setDropdown]);

  return [showDropdown, hideDropdown];
}

export { useDropdown };
