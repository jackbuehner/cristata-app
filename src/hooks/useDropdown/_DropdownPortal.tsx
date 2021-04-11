import { useMemo, useEffect, useCallback, forwardRef, ForwardedRef } from 'react';
import ReactDOM from 'react-dom';

interface IDropdownPortal {
  Dropdown?: React.FunctionComponent<{}>;
  isOpen: boolean;
}

/**
 * The portal for dropdowns.
 */
const DropdownPortal = forwardRef(
  ({ Dropdown, isOpen }: IDropdownPortal, ref: ForwardedRef<HTMLDivElement>) => {
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
    }, [el]);

    /**
     * Removes the div if it is inside the document body.
     */
    const removeEl = useCallback(() => {
      const el = document.getElementById('dropdown-root');
      if (el) document.body.removeChild(el);
    }, []);

    // Appends/removes `el` based on whether the dropdown is opened or closed
    useEffect(() => {
      if (isOpen) appendEl();
      else removeEl();
      return () => {
        if (!isOpen) removeEl();
      };
    }, [appendEl, el, isOpen, removeEl]);

    // insert the dropdown component into the dropdown
    return ReactDOM.createPortal(<div ref={ref}>{Dropdown}</div>, el);
  }
);

export { DropdownPortal };
