import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const WALKTHROUGH_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to NexaSphere!',
    description: 'Let us take you on a quick tour to help you get started with key features.',
    target: 'center', // special target for screen center
  },
  {
    id: 'search_events',
    title: 'Find Events',
    description: 'Use the search bar to find events and filter them by category or date.',
    target: 'element',
  },
  {
    id: 'register_event',
    title: 'Register for Events',
    description: 'Tap on any event card and click register to secure your spot.',
    target: 'element',
  },
  {
    id: 'profile',
    title: 'Set Up Your Profile',
    description: 'Update your profile to stand out to organizers and other attendees.',
    target: 'element',
  },
  {
    id: 'notifications',
    title: 'Stay Notified',
    description: 'Check here for important updates about your registered events.',
    target: 'element',
  },
];

export const useWalkthroughStore = create(
  persist(
    (set, get) => ({
      isActive: false,
      currentStepIndex: 0,
      hasCompleted: false,
      elements: {}, // { [stepId]: DOMRect }

      startWalkthrough: () => set({ isActive: true, currentStepIndex: 0 }),

      nextStep: () => {
        const { currentStepIndex } = get();
        if (currentStepIndex < WALKTHROUGH_STEPS.length - 1) {
          set({ currentStepIndex: currentStepIndex + 1 });
        } else {
          get().completeWalkthrough();
        }
      },

      skipWalkthrough: () => set({ isActive: false, hasCompleted: true }),

      completeWalkthrough: () => set({ isActive: false, hasCompleted: true }),

      registerElement: (stepId, rect) =>
        set((state) => ({
          elements: { ...state.elements, [stepId]: rect },
        })),

      unregisterElement: (stepId) =>
        set((state) => {
          const newElements = { ...state.elements };
          delete newElements[stepId];
          return { elements: newElements };
        }),
    }),
    {
      name: 'nexasphere-walkthrough-storage',
      partialize: (state) => ({ hasCompleted: state.hasCompleted }), // Only persist completion state
    }
  )
);
