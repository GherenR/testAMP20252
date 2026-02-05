import { useState, useEffect } from 'react';

/**
 * Custom hook untuk mengelola navigasi antar slide
 * Menangani state currentSlide dan smooth scroll ke atas saat slide berubah
 */
export const useSlideNavigation = (totalSlides: number) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Scroll ke atas dengan smooth behavior saat slide berubah
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentSlide]);

  const goToSlide = (slideIndex: number) => {
    if (slideIndex >= 0 && slideIndex < totalSlides) {
      setCurrentSlide(slideIndex);
    }
  };

  const nextSlide = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return {
    currentSlide,
    setCurrentSlide,
    goToSlide,
    nextSlide,
    prevSlide
  };
};
