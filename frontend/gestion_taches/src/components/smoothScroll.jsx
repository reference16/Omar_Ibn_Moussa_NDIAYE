import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return isVisible ? (
    <button
      onClick={scrollToTop}
      className="fixed bottom-4 right-4 bg-teal-500 text-white p-2 rounded-full shadow-lg hover:bg-teal-600 transition-colors"
      aria-label="Retour en haut"
    >
      ↑
    </button>
  ) : null;
};

export const AnimatedSection = ({ children }) => {
  return (
    <div>
      {children}
    </div>
  );
};

AnimatedSection.propTypes = {
  children: PropTypes.node.isRequired
};
