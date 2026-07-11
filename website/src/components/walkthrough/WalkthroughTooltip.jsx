import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useWalkthroughStore, WALKTHROUGH_STEPS } from '../../store/useWalkthroughStore';

export function WalkthroughTooltip() {
  const currentStepIndex = useWalkthroughStore((state) => state.currentStepIndex);
  const nextStep = useWalkthroughStore((state) => state.nextStep);
  const skipWalkthrough = useWalkthroughStore((state) => state.skipWalkthrough);

  const step = WALKTHROUGH_STEPS[currentStepIndex];
  const isLast = currentStepIndex === WALKTHROUGH_STEPS.length - 1;

  if (!step) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-6 w-[350px] relative z-50 border border-gray-100 dark:border-gray-700 pointer-events-auto"
    >
      <button
        onClick={skipWalkthrough}
        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        aria-label="Skip walkthrough"
      >
        <X className="w-5 h-5" />
      </button>

      <div className="mb-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
        Step {currentStepIndex + 1} of {WALKTHROUGH_STEPS.length}
      </div>

      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{step.title}</h3>

      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">{step.description}</p>

      <div className="flex justify-between items-center">
        <button
          onClick={skipWalkthrough}
          className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
        >
          Skip Tour
        </button>
        <button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
        >
          {isLast ? "Let's go!" : 'Next'}
        </button>
      </div>
    </motion.div>
  );
}
