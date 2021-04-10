import { useState } from 'react';

/**
 * Hook to handle modal visibility.
 */
const useModal = () => {
  // store whether the modal is open
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Toggles the modal open state.
   */
  function toggleModal() {
    setIsModalOpen(!isModalOpen);
  }

  /**
   * Sets the modal open state to true.
   */
  function showModal() {
    setIsModalOpen(true);
  }

  /**
   * Sets the modal open state to false.
   */
  function hideModal() {
    setIsModalOpen(true);
  }

  return {
    toggleModal,
    showModal,
    hideModal,
  };
};

export { useModal };
