/**
 * SkipLink.jsx
 *
 * Accessible "Skip to main content" landmark link.
 *
 * - Positioned off-screen until focused by the keyboard.
 * - Slides in visually on first Tab press (see accessibility.css).
 * - Programmatically focuses the target element on click/Enter so focus
 *   actually moves inside the main region (required when the target is not
 *   natively focusable, e.g. a <main> or <section>).
 *
 * Usage:
 *   <SkipLink targetId="main-content" />
 *   ...
 *   <main id="main-content" tabIndex={-1}>...</main>
 */

import React, { useCallback } from 'react';

const SkipLink = ({ targetId = 'main-content', label = 'Skip to main content' }) => {
  const handleClick = useCallback(
    (e) => {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) {
        // Move focus into the region so screen readers announce the heading
        target.focus({ preventScroll: false });
        // Smoothly scroll the page to the target
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    },
    [targetId]
  );

  return (
    <a
      href={`#${targetId}`}
      className="skip-link"
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick(e);
        }
      }}
    >
      {label}
    </a>
  );
};

export default SkipLink;
