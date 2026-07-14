import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWalkthroughStore, WALKTHROUGH_STEPS } from '../../store/useWalkthroughStore';
import { WalkthroughTooltip } from './WalkthroughTooltip';

export function WalkthroughOverlay() {
  const isActive = useWalkthroughStore((state) => state.isActive);
  const currentStepIndex = useWalkthroughStore((state) => state.currentStepIndex);
  const elements = useWalkthroughStore((state) => state.elements);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () =>
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isActive) return null;

  const step = WALKTHROUGH_STEPS[currentStepIndex];
  if (!step) return null;

  const isCenter = step.target === 'center';
  const targetRect = elements[step.id];

  // If it's an element target but the element isn't registered yet, wait (or fallback to center)
  if (!isCenter && !targetRect) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center">
        <WalkthroughTooltip />
      </div>
    );
  }

  const spotlightPadding = 8;
  const spotlightBorderRadius = 12;

  // Calculate position for the tooltip to avoid covering the spotlight
  let tooltipPosition = { top: '50%', left: '50%', x: '-50%', y: '-50%' };
  if (!isCenter && targetRect) {
    const spaceBelow = windowSize.height - (targetRect.top + targetRect.height + spotlightPadding);
    const spaceAbove = targetRect.top - spotlightPadding;

    if (spaceBelow > 350 || spaceBelow > spaceAbove) {
      // Place below
      tooltipPosition = {
        top: targetRect.top + targetRect.height + spotlightPadding + 16,
        left: Math.max(16, Math.min(targetRect.left, windowSize.width - 366)),
        x: '0%',
        y: '0%',
      };
    } else {
      // Place above
      tooltipPosition = {
        top: targetRect.top - spotlightPadding - 16,
        left: Math.max(16, Math.min(targetRect.left, windowSize.width - 366)),
        x: '0%',
        y: '-100%',
      };
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <AnimatePresence>
        <motion.div
          key={step.id + '-spotlight'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="absolute rounded-xl"
          style={{
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.75)',
            top: isCenter ? '50%' : targetRect.top - spotlightPadding,
            left: isCenter ? '50%' : targetRect.left - spotlightPadding,
            width: isCenter ? 0 : targetRect.width + spotlightPadding * 2,
            height: isCenter ? 0 : targetRect.height + spotlightPadding * 2,
            borderRadius: spotlightBorderRadius,
            x: isCenter ? '-50%' : 0,
            y: isCenter ? '-50%' : 0,
            pointerEvents: 'none',
          }}
        />

        <motion.div
          key={step.id + '-tooltip'}
          className="absolute pointer-events-auto"
          initial={false}
          animate={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            x: tooltipPosition.x,
            y: tooltipPosition.y,
          }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
        >
          <WalkthroughTooltip />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
