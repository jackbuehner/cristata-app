import { useMemo, useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';

interface IDropdownPortal {
  Dropdown?: React.ReactElement;
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  hideOnClick: boolean;
  hideOnScroll: boolean;
}

/**
 * The portal for dropdowns.
 */
function DropdownPortal({ Dropdown, isOpen, setIsOpen, hideOnClick, hideOnScroll }: IDropdownPortal) {
  /**
   * A memoized `div` with `id` `'dropdown-root'`
   */
  const el = useMemo(() => {
    const el = document.createElement('div');
    el.id = 'dropdown-root';
    return el;
  }, []);

  /**
   * Appends the div to the document body.
   */
  const appendEl = useCallback(() => {
    document.body.appendChild(el);
    el.style.opacity = '1';
  }, [el]);

  /**
   * Removes the div if it is inside the document body.
   */
  const removeEl = useCallback(() => {
    const el = document.getElementById('dropdown-root');
    if (el) document.body.removeChild(el);
  }, []);

  // Appends/removes `el` based on whether the dropdown is opened or closed
  const timeout = useRef<NodeJS.Timeout>();
  useEffect(() => {
    if (timeout.current) clearTimeout(timeout.current);
    if (isOpen) appendEl();
    else {
      el.style.transition = 'opacity 240ms';
      el.style.opacity = '0';
      timeout.current = setTimeout(() => {
        if (!isOpen) removeEl();
      }, 240);
    }
    return () => {
      if (!isOpen) {
        removeEl();
        if (timeout.current) clearTimeout(timeout.current);
      }
    };
  }, [appendEl, el, isOpen, removeEl]);

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
    const closeOnClick = (e: Event) => {
      const target = e.target as HTMLElement | null;

      // determine if the click occured within the menu div
      const isInSelf = (() => {
        if (!target) return false;
        const checkParent = (elem: HTMLElement): boolean => {
          if (elem.parentElement) {
            if (elem.parentElement.classList.contains('menu')) return true;
            return checkParent(elem.parentElement);
          }
          return false;
        };

        return checkParent(target);
      })();

      // only close if the click event did not occur in the dropdown
      if (!isInSelf) {
        hideDropdown();
      }
    };

    if (hideOnClick) document.addEventListener('click', closeOnClick, true);
    return () => document.removeEventListener('click', closeOnClick, true);
  }, [hideOnClick]);

  /**
   * Listen for any scroll or events on the page
   * or page resize events
   * and close the dropdown if they occur.
   */
  useEffect(() => {
    if (hideOnScroll) {
      const closeOnScroll = (e: Event) => {
        const target = e.target as HTMLElement | null;
        const isSelf = target?.classList?.contains('menu') || false;

        // only close if the scroll event did not occur in the dropdown
        if (!isSelf) {
          hideDropdown();
        }
      };
      const closeOnResize = () => hideDropdown();

      document.addEventListener('scroll', closeOnScroll, { capture: true, passive: true });
      document.addEventListener('resize', closeOnResize, { capture: true, passive: true });
      return () => {
        document.removeEventListener('scroll', closeOnScroll, { capture: true });
        document.removeEventListener('resize', closeOnResize, { capture: true });
      };
    }
  });

  // insert the dropdown component into the dropdown
  return ReactDOM.createPortal(Dropdown, el);
}

export { DropdownPortal };
