import { useEffect, useState } from 'react';

// Scroll threshold for showing the "back to top" button (in pixels).
// Chosen to show the button after the user has started scrolling without cluttering the UI.
const SCROLL_THRESHOLD = 30;

function MoveToTop() {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    function handleScroll() {
      if (window.scrollY > SCROLL_THRESHOLD) {
        setShowButton(true);
      } else {
        setShowButton(false);
      }
    }
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  function scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }
  return (
    <>
      {showButton && (
        <button className="move-to-top" onClick={scrollToTop} aria-label="Scroll to top">
          ↑
        </button>
      )}
    </>
  );
}

export default MoveToTop;
