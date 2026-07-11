import React from 'react';
import { useWalkthroughStep } from '../../hooks/useWalkthroughStep';

export function WalkthroughWrapper({ stepId, children, as: Component = 'div', ...props }) {
  const ref = useWalkthroughStep(stepId);
  return (
    <Component ref={ref} {...props}>
      {children}
    </Component>
  );
}
