import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { DropdownContext } from './_DropdownContext';

/**
 * React hook for showing dropdowns.
 * @param component a React fucntional component
 * @param deps (optional) dependencies for the functional component
 * @returns [showDropdown, hideDropdown, triggerRect]
 */
function useDropdown(
  component: React.FunctionComponent<any>,
  deps?: any[],
  hideOnClick?: boolean,
  hideOnScroll?: boolean
) {
  const { setDropdown, setIsOpen, dropdownChildren } = useContext(DropdownContext)!; // end with `!` to tell typescipt that the context is not undefined

  // store the position and size information of the last element that executed `showDropdown()`
  const [triggerRect, setTriggerRect] = useState<DOMRect>(new DOMRect());

  // memoize the dropdown component so that it does not trigger `setDropdown` on every render
  // (only trigger `setDropdown` when `deps` has changed)
  const dropdownComponent = useMemo(
    () => {
      return component;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps ? [triggerRect, ...deps] : [triggerRect]
  );

  // when provided `dropdownComponent` changes, update the dropdown in the dropdown portal
  useEffect(() => {
    setDropdown(dropdownComponent);
  }, [dropdownComponent, setDropdown]);

  const getDropdownRect = useCallback(() => {
    if (dropdownChildren && dropdownChildren.length > 0) {
      return dropdownChildren[0].getBoundingClientRect();
    }
  }, [dropdownChildren]);

  /**
   * Shows the dropdown.
   */
  const showDropdown = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    setTriggerRect(e.currentTarget.getBoundingClientRect());
    setIsOpen(true);
  };

  /**
   * Hides the dropdown.
   */
  const hideDropdown = () => {
    setIsOpen(false);
  };

  /**
   * Listen for any scroll events on the page
   * and close the dropdown if they occur.
   */
  useEffect(() => {
    if (hideOnScroll) {
      const closeOnScroll = () => {
        hideDropdown();
      };
      document.addEventListener('scroll', closeOnScroll, true);
      return document.removeEventListener('scroll', closeOnScroll);
    }
  });

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

  return { showDropdown, hideDropdown, triggerRect, getDropdownRect };
}

export { useDropdown };
