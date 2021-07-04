import { useState } from 'react';

/**
 * Hook to handle  nav visibility.
 */
const useIsNavVisible = () => {
  // store whether the nav is shown
  const [isNavVisible, setIsNavVisible] = useState(false);

  /**
   * Sets the modal open state to true.
   */
  function showNav() {
    setIsNavVisible(true);
  }

  /**
   * Sets the modal open state to false.
   */
  function hideNav() {
    setIsNavVisible(false);
  }

  return {
    showNav,
    hideNav,
    isNavVisible,
  };
};

export { useIsNavVisible };
