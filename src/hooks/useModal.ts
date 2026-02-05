import { useState } from 'react';
import { Mentor } from '../types';

/**
 * Custom hook untuk mengelola state modal secara generic
 * Bisa dipakai untuk berbagai modal dengan berbagai data types
 */
export const useModal = <T,>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const open = (modalData: T) => {
    setData(modalData);
    setIsOpen(true);
  };

  const close = () => {
    setIsOpen(false);
    setData(null);
  };

  const toggle = (modalData?: T) => {
    if (isOpen) {
      close();
    } else if (modalData) {
      open(modalData);
    } else {
      setIsOpen(!isOpen);
    }
  };

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
    setIsOpen,
    setData
  };
};

/**
 * Specialized hook untuk Chat Modal yang membutuhkan selected mentor
 */
export const useChatModal = () => {
  return useModal<Mentor>();
};

/**
 * Specialized hook untuk SOP Modal
 */
export const useSopModal = () => {
  return useModal<Mentor>();
};
