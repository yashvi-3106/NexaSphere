const fs = require('fs');

const path = 'd:\\work\\NexaSphere\\website\\src\\App.jsx';
let content = fs.readFileSync(path, 'utf8');

// Conflict 1: lines 54-358
const conflict1Regex =
  /<<<<<<< HEAD\r?\nimport \{ BookmarkProvider \}[\s\S]*?=======\r?\n>>>>>>> [a-f0-9]+/;
content = content.replace(
  conflict1Regex,
  `import { useStudentAuth } from './context/StudentAuthContext';
import { WalkthroughOverlay } from './components/walkthrough/WalkthroughOverlay';
import { useWalkthroughStore } from './store/useWalkthroughStore';
import { useAnalytics } from './hooks/useAnalytics';
import { SessionRecordingProvider } from './context/SessionRecordingProvider';
// Removed duplicate components like Wipe, PageIn, Cursor
`
);

// Conflict 2: lines 375-390
const conflict2Regex =
  /<<<<<<< HEAD\r?\n  const \{ isAuthenticated, loading: authLoading \} = useStudentAuth\(\);[\s\S]*?=======\r?\n  const \{ eventsData, swUpdateFn \} = useAppBootstrap\(cinDone\);\r?\n>>>>>>> [a-f0-9]+/;
content = content.replace(
  conflict2Regex,
  `  const { eventsData, swUpdateFn } = useAppBootstrap(cinDone);
  const { isAuthenticated, loading: authLoading } = useStudentAuth();
  const hasCompletedWalkthrough = useWalkthroughStore((state) => state.hasCompleted);
  const startWalkthrough = useWalkthroughStore((state) => state.startWalkthrough);

  useEffect(() => {
    if (cinDone && !authLoading && isAuthenticated && !hasCompletedWalkthrough) {
      const t = setTimeout(() => {
        startWalkthrough();
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [cinDone, authLoading, isAuthenticated, hasCompletedWalkthrough, startWalkthrough]);`
);

// Conflict 3: lines 735-741
const conflict3Regex =
  /<<<<<<< HEAD\r?\n\r?\n      \{cinDone && <FloatingDock \/>\}\r?\n    <\/SessionRecordingProvider>\r?\n=======\r?\n    <\/>\r?\n>>>>>>> [a-f0-9]+/;
content = content.replace(
  conflict3Regex,
  `
    </SessionRecordingProvider>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('App.jsx conflicts resolved!');
