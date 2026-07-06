import { useEffect, useRef } from 'react';
import { useWalkthroughStore } from '../store/useWalkthroughStore';

/**
 * Hook to register a DOM element as a target for the walkthrough overlay.
 * @param {string} stepId - The unique ID of the walkthrough step.
 * @returns {React.RefObject} - A ref to attach to the target DOM element.
 */
export function useWalkthroughStep(stepId) {
  const ref = useRef(null);
  const registerElement = useWalkthroughStore((state) => state.registerElement);
  const unregisterElement = useWalkthroughStore((state) => state.unregisterElement);
  const isActive = useWalkthroughStore((state) => state.isActive);

  useEffect(() => {
    const element = ref.current;
    if (!element || !isActive) return;

    // Initial registration
    const updateRect = () => {
      if (element) {
        const rect = element.getBoundingClientRect();
        registerElement(stepId, {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    updateRect();

    // Re-calculate on resize or scroll
    const resizeObserver = new ResizeObserver(() => updateRect());
    resizeObserver.observe(element);
    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
      unregisterElement(stepId);
    };
  }, [stepId, isActive, registerElement, unregisterElement]);

  return ref;
}
