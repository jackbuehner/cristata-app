import type React from 'react';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'svelte-preprocess-react/react-router';
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
    props: T,
    more: {
      navigate: (
        to: Parameters<ReturnType<typeof useNavigate>>[0],
        options?: Parameters<ReturnType<typeof useNavigate>>[1]
      ) => void;
      close: () => void;
      firstElementChildHeight: number;
    }
  ) => React.ReactElement,
  deps?: any[],
  hideOnClick?: boolean,
  hideOnScroll?: boolean
): [(e: React.MouseEvent<HTMLElement, MouseEvent>, dropdownProps?: T) => void, () => void] {
  const { setDropdown, setIsOpen, setHideOnClick, setHideOnScroll } = useContext(DropdownContext)!; // end with `!` to tell typescipt that the context is not undefined

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
    setHideOnClick((current) => (hideOnClick === undefined ? current : hideOnClick));
    setHideOnScroll((current) => (hideOnScroll === undefined ? current : hideOnScroll));
  };

  /**
   * Hides the dropdown.
   */
  const hideDropdown = () => {
    setIsOpen(false);
  };

  const [firstElementChildHeight, setHeight] = useState(0);

  /**
   * Callback ref for the dropdown, which is used to focus the dropdown once
   * it appears.
   */
  const dropdownRef = (el: HTMLOListElement) => {
    if (el) {
      el.focus();
      setHeight((el.firstElementChild as HTMLDivElement | undefined)?.offsetHeight || 0);
    }
  };

  const _navigate = useNavigate();
  const navigate = (
    to: Parameters<ReturnType<typeof useNavigate>>[0],
    options?: Parameters<ReturnType<typeof useNavigate>>[1]
  ): void => {
    _navigate(to, options);
    hideDropdown();
  };

  // memoize the dropdown component so that it does not trigger `setDropdown` on every render
  // (only trigger `setDropdown` when `deps` has changed)
  const DropdownComponent = useMemo(
    () => {
      return component(triggerRect, dropdownRef, dropdownProps, {
        navigate,
        close: hideDropdown,
        firstElementChildHeight,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [triggerRect, dropdownProps, firstElementChildHeight, ...(deps || [])]
  );

  // when provided `DropdownComponent` changes, update the dropdown in the dropdown portal
  useEffect(() => {
    setDropdown(DropdownComponent);
  }, [DropdownComponent, setDropdown]);

  return [showDropdown, hideDropdown];
}

export { useDropdown };
