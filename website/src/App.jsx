import { useState, useEffect, useCallback } from 'react';
import { createBrowserRouter, RouterProvider, useLocation, useNavigate } from 'react-router-dom';

import './styles/themes.css';
import './styles/globals.css';
import './styles/animations.css';
import './styles/chatbot.css';
import './styles/components.css';
import './styles/portfolio.css';
import './styles/pwa.css';
import './styles/aurora.css';
import './styles/motion.css';
import './i18n';

// Core structural elements
import AppProviders from './providers/AppProviders';
import AppRoutes from './router/routes';
import useAppBootstrap from './hooks/useAppBootstrap';
import { useTheme } from './hooks/useTheme';
import { useDeveloperMode } from './hooks/useDeveloperMode';
import { useInteractionEffects } from './hooks/useInteractionEffects';
import { useBackToTop } from './hooks/useScrollLogic';

// Shared layout and telemetry widgets
import Navbar from './shared/Navbar';
import MoveToTop from './shared/MoveToTop';
import Chatbot from './shared/Chatbot';
import ScrollProgress from './shared/ScrollProgress';
import SearchBar from './components/SearchBar';
import Terminal from './components/developer/Terminal';
import BookmarksDrawer from './components/bookmarks/BookmarksDrawer';
import CinematicOpening from './shared/CinematicOpening';
import OfflineBanner from './components/pwa/OfflineBanner.jsx';
import InstallPrompt from './components/pwa/InstallPrompt.jsx';
import UpdatePrompt from './components/pwa/UpdatePrompt.jsx';

import {
  AmbientOrbs,
  useNsReveal,
  useHeroParallax,
  useNavScrollTint,
  useGlobalMouseParallax,
  useMagneticCards,
} from './shared/MotionLayer';
import { activityPages } from './data/activities/index';

const isPlaywright =
  typeof window !== 'undefined' && window.navigator.userAgent.includes('Playwright');

import { BookmarkProvider } from './context/BookmarkContext';
import { StudentAuthProvider, useStudentAuth } from './context/StudentAuthContext';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy-loaded heavy pages
const RecruitmentPage = lazy(() => import('./pages/recruitment/RecruitmentPage'));
const MembershipPage = lazy(() => import('./pages/membership/MembershipPage'));
const ActivitiesPage = lazy(() => import('./pages/activities/ActivitiesPage'));
const ActivityDetailPage = lazy(() => import('./pages/activities/ActivityDetailPage'));
const EventsPage = lazy(() => import('./pages/events/EventsPage'));
const EventDetailPage = lazy(() => import('./pages/events/EventDetailPage'));
const EventPlanningPage = lazy(() => import('./pages/events/EventPlanningPage'));
const AboutPage = lazy(() => import('./pages/about/AboutPage'));
const TeamPage = lazy(() => import('./pages/team/TeamPage'));
const ContactPage = lazy(() => import('./pages/contact/ContactPage'));
const RoadmapsPage = lazy(() => import('./pages/roadmaps/RoadmapsPage'));
const ProjectsPage = lazy(() => import('./pages/projects/ProjectsPage'));
const CertificateVerifyPage = lazy(() => import('./pages/certificates/CertificateVerifyPage'));
const PortfolioBuilder = lazy(() => import('./components/portfolio/PortfolioBuilder'));
const PortfolioAnalytics = lazy(() => import('./pages/portfolio/PortfolioAnalytics'));
const PublicPortfolio = lazy(() => import('./pages/portfolio/PublicPortfolio'));
const DashboardPage = lazy(() => import('./pages/dashboard/DashboardPage'));
const AnalyticsPage = lazy(() => import('./pages/analytics/AnalyticsPage'));
const WorkspacePage = lazy(() => import('./pages/workspace/WorkspacePage'));
const GamificationDashboard = lazy(() => import('./components/gamification/GamificationDashboard'));
const ForumPage = lazy(() => import('./pages/forum/ForumPage'));
const ForumThreadPage = lazy(() => import('./pages/forum/ForumThreadPage'));
const LoginPage = lazy(() => import('./pages/login/LoginPage'));
const MentorsPage = lazy(() => import('./pages/mentorship/MentorsPage'));
const MentorshipDashboard = lazy(() => import('./pages/mentorship/MentorshipDashboard'));
const StatusPage = lazy(() => import('./pages/StatusPage'));
const LiveStreamPage = lazy(() => import('./pages/streaming/LiveStreamPage'));
const NotificationHistoryPage = lazy(() => import('./pages/notifications/NotificationHistoryPage'));
const SponsorsPage = lazy(() => import('./pages/sponsors/SponsorsPage'));
const SearchPage = lazy(() => import('./pages/search/SearchPage'));

/* â”€â”€ Page wipe transition â”€â”€ */
const Wipe = memo(function Wipe({ on: wipeOn, ph }) {
  if (!wipeOn) return null;
  return (
    <>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8000,
          background: 'var(--bg)',
          animation: `${ph === 'out' ? 'wipeDown .27s' : 'wipeUp .30s'} cubic-bezier(.77,0,.18,1) forwards`,
          pointerEvents: 'all',
        }}
      />
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8001,
          background: 'linear-gradient(90deg,#CC1111,#880000,#EE2222)',
          opacity: 0.09,
          animation: `${ph === 'out' ? 'wipeDown .20s .04s' : 'wipeUp .24s .04s'} cubic-bezier(.77,0,.18,1) forwards`,
          pointerEvents: 'none',
        }}
      />
      {ph === 'out' && <div className="wipe-shimmer" aria-hidden="true" />}
      {ph === 'in' && <PageFlash />}
      {ph === 'out' && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%,-50%)',
            zIndex: 8002,
            pointerEvents: 'none',
            opacity: 0,
            animation: 'splashIn .16s .1s ease forwards',
          }}
        >
          <img
            src={nexasphereLogo}
            style={{
              height: '46px',
              mixBlendMode: 'screen',
              filter: 'drop-shadow(0 0 12px var(--c1))',
              opacity: 0.6,
            }}
            alt=""
          />
        </div>
      )}
    </>
  );
});

/* â”€â”€ Page enter animation â”€â”€ */
const PageIn = memo(function PageIn({ children, k }) {
  const [r, setR] = useState(false);
  useLayoutEffect(() => {
    let rafOne = 0;
    let rafTwo = 0;
    setR(false);
    rafOne = requestAnimationFrame(() => {
      rafTwo = requestAnimationFrame(() => setR(true));
    });
    return () => {
      cancelAnimationFrame(rafOne);
      cancelAnimationFrame(rafTwo);
    };
  }, [k]);
  return (
    <div
      style={{
        opacity: r ? 1 : 0,
        transform: r ? 'none' : 'translateY(16px) scale(.99)',
        transition:
          'opacity .42s cubic-bezier(.22,1,.36,1),transform .42s cubic-bezier(.22,1,.36,1)',
        willChange: 'opacity,transform',
      }}
    >
      {children}
    </div>
  );
});

/* --   Root App â€” wraps everything in BrowserRouter
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const router = createBrowserRouter([
  { path: '*', element: <AppProviders><AppShell /></AppProviders> }
]);

export default function App() {
  return <RouterProvider router={router} />;
}

function AppShell() {
  const location = useLocation();
  const [cinDone, setCinDone] = useState(() => isPlaywright);
  const { resolvedTheme: theme } = useTheme();
  const { isOpen: isTerminalOpen, closeTerminal } = useDeveloperMode();

  const { eventsData, swUpdateFn } = useAppBootstrap(cinDone);
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
  }, [cinDone, authLoading, isAuthenticated, hasCompletedWalkthrough, startWalkthrough]);

  // Skip cinematic opening for deep links (anything except "/")
  useEffect(() => {
    if (location.pathname !== '/' || isPlaywright) {
      setCinDone(true);
    }
  }, [location.pathname]);

  const [searchOpen, setSearchOpen] = useState(false);
  const [bookmarksOpen, setBookmarksOpen] = useState(false);

  // Ctrl+K / Cmd+K search trigger
  useEffect(() => {
    const fn = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen((s) => !s);
      }
    };
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, []);

  return (
    <>
      <OfflineBanner />
      <InstallPrompt />
      {swUpdateFn && <UpdatePrompt updateSW={swUpdateFn} />}

      <Chatbot />
      <WalkthroughOverlay />

      {/* Loading cover to prevent flash during intro sequence */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 8900,
          background: theme === 'light' ? '#FFFFFF' : '#0A0A0A',
          opacity: cinDone ? 0 : 1,
          transition: 'opacity .5s ease',
          pointerEvents: 'none',
        }}
      />

      {!cinDone && <CinematicOpening theme={theme} onDone={() => setCinDone(true)} />}

      {cinDone && <ScrollProgress />}
      <Cursor />

      <MainRouter
        cinDone={cinDone}
        setCinDone={setCinDone}
        theme={theme}
        eventsData={eventsData}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        bookmarksOpen={bookmarksOpen}
        setBookmarksOpen={setBookmarksOpen}
        isTerminalOpen={isTerminalOpen}
        closeTerminal={closeTerminal}
      />
    </>
  );
}

function MainRouter({
  cinDone,
  theme,
  eventsData,
  searchOpen,
  setSearchOpen,
  bookmarksOpen,
  setBookmarksOpen,
  isTerminalOpen,
  closeTerminal,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { sessionId } = useAnalytics();

  const [mobile, setMobile] = useState(window.innerWidth <= 768);
  const [wipeOn, setWipeOn] = useState(false);
  const [wipePh, setWipePh] = useState('out');
  const [activeTab, setActiveTab] = useState('Home');

  useEffect(() => {
    const fn = () => setMobile(window.innerWidth <= 768);
    window.addEventListener('resize', fn, { passive: true });
    return () => window.removeEventListener('resize', fn);
  }, []);

  // Sync activeTab with route path
  useEffect(() => {
    const pathMap = {
      '/': 'Home',
      '/activities': 'Activities',
      '/events': 'Events',
      '/projects': 'Projects',
      '/roadmaps': 'Roadmaps',
      '/about': 'About',
      '/team': 'Core Team',
      '/contact': 'Contact',
      '/dashboard': 'Dashboard',
      '/analytics': 'Analytics',
      '/explore': 'Explore',
      '/forum': 'Forum',
    };
    const tab = pathMap[location.pathname] || 'Home';
    setActiveTab(tab);
  }, [location.pathname]);

  // Scroll spy on home page
  useEffect(() => {
    if (location.pathname !== '/') return;
    const HOME_SECTIONS = ['Home', 'Activities', 'Events', 'About', 'Core Team', 'Contact'];
    const nh = mobile ? MNH : DNH;
    const fn = () => {
      const sy = window.scrollY + nh + 30;
      for (let i = HOME_SECTIONS.length - 1; i >= 0; i--) {
        const idStr = HOME_SECTIONS[i] === 'Core Team' ? 'team' : HOME_SECTIONS[i].toLowerCase();
        const el = document.getElementById(`section-${idStr}`);
        if (el && el.offsetTop <= sy) {
          setActiveTab(HOME_SECTIONS[i]);
          break;
        }
      }
    };
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, [mobile, location.pathname]);

  // Wire motion effects and event scroll behaviors
  useInteractionEffects(cinDone, location.pathname !== '/');
  useBackToTop();
  useNsReveal([cinDone, location.pathname]);
  useHeroParallax();
  useNavScrollTint();
  useGlobalMouseParallax();
  useMagneticCards();

  // Screen wipe transition utility
  const nav = useCallback(
    (path, fn) => {
      setWipeOn(true);
      setWipePh('out');
      setTimeout(() => {
        if (fn) fn();
        if (path) navigate(path);
        window.scrollTo({ top: 0 });
        requestAnimationFrame(() => {
          setWipePh('in');
          setTimeout(() => setWipeOn(false), 340);
        });
      }, 275);
    },
    [navigate]
  );

  const onTab = useCallback(
    (tab) => {
      const routeMap = {
        Dashboard: '/dashboard',
        Analytics: '/analytics',
        Activities: '/activities',
        Events: '/events',
        Projects: '/projects',
        Roadmaps: '/roadmaps',
        Explore: '/explore',
        Resources: '/resources',
        About: '/about',
        'Core Team': '/team',
        Contact: '/contact',
        Forum: '/forum',
      };
      const targetPath = routeMap[tab];
      if (targetPath) {
        nav(targetPath);
        return;
      }
      if (tab === 'Home') {
        if (location.pathname !== '/') {
          nav('/');
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      const idStr = tab === 'Core Team' ? 'team' : tab.toLowerCase();
      if (location.pathname === '/') {
        setActiveTab(tab);
        const el = document.getElementById(`section-${idStr}`);
        if (el) {
          window.scrollTo({
            top: el.offsetTop - (mobile ? MNH : DNH),
            behavior: 'smooth',
          });
        }
      } else {
        nav('/', () => {
          setTimeout(() => {
            const el = document.getElementById(`section-${idStr}`);
            if (el) {
              window.scrollTo({
                top: el.offsetTop - (mobile ? MNH : DNH),
                behavior: 'smooth',
              });
            }
          }, 50);
        });
      }
    },
    [nav, mobile, location.pathname]
  );

  const openApply = useCallback(() => nav('/apply'), [nav]);
  const openJoin = useCallback(() => nav('/join'), [nav]);
  const onBackHome = useCallback(() => nav('/'), [nav]);

  const onNavigate = useCallback(
    (type, title) => {
      if (type === 'activity') nav(`/activities/${encodeURIComponent(title)}`);
    },
    [nav]
  );

  const onKSSClick = useCallback(
    (ev) => {
      nav(`/events/${ev.id || encodeURIComponent(ev.name || '')}`);
    },
    [nav]
  );

  const nh = mobile ? MNH : DNH;

  return (
    <SessionRecordingProvider sessionId={sessionId}>
      {cinDone && <AmbientOrbs theme={theme} />}
      {cinDone && (
        <Navbar
          activeTab={activeTab}
          onTabChange={onTab}
          theme={theme}
          onApply={openApply}
          onJoin={openJoin}
          onToggleBookmarks={() => setBookmarksOpen((prev) => !prev)}
          onSearchToggle={() => setSearchOpen(true)}
        />
      )}

      <Wipe on={wipeOn} ph={wipePh} />

      <main style={{ paddingTop: nh, position: 'relative', zIndex: 1 }}>
        <Suspense fallback={<PageLoadingSpinner />}>
          <Routes>
            {/* â”€â”€ Home (scrollable sections) â”€â”€ */}
            <Route
              path="/"
              element={
                cinDone ? (
                  <PageIn k="home">
                    <HeroSection
                      onTabChange={onTab}
                      onApply={openApply}
                      onJoin={openJoin}
                      theme={theme}
                    />
                    <SectionDivider />
                    <ActivitiesSection onNavigate={onNavigate} />
                    <SectionDivider />
                    <EventsSection onEventClick={onKSSClick} events={eventsData} />
                    <SectionDivider />
                    <AboutSection />
                    <SectionDivider />
                    <TeamSection onApply={openApply} />
                    <div id="section-contact">
                      <Footer
                        onAdmin={() => nav('/admin')}
                        onProjects={() => onTab('Projects')}
                        onRoadmaps={() => onTab('Roadmaps')}
                      />
                    </div>
                  </PageIn>
                ) : null
              }
            />

            {/* â”€â”€ Activities â”€â”€ */}
            <Route
              path="/activities"
              element={
                <ErrorBoundary>
                  <PageIn k="activities">
                    <ActivitiesPage onNavigate={onNavigate} onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />
            <Route
              path="/activities/:activityKey"
              element={
                <ErrorBoundary>
                  <ActivityDetailWrapper
                    onBack={() => nav('/activities')}
                    onSelectEvent={onKSSClick}
                  />
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Events â”€â”€ */}
            <Route
              path="/events"
              element={
                <ErrorBoundary>
                  <PageIn k="events">
                    <EventsPage onBack={onBackHome} onEventClick={onKSSClick} events={eventsData} />
                  </PageIn>
                </ErrorBoundary>
              }
            />
            <Route
              path="/events/:eventId"
              element={
                <ErrorBoundary>
                  <EventDetailWrapper onBack={() => nav('/events')} events={eventsData} />
                </ErrorBoundary>
              }
            />

            {/* ── Event Planning (collaborative) ── */}
            <Route
              path="/events/:eventId/planning"
              element={<EventPlanningWrapper onBack={() => nav('/events')} />}
            />

            {/* ── Live Streaming ── */}
            <Route
              path="/stream/:eventId"
              element={
                <ErrorBoundary>
                  <PageIn k="stream">
                    <LiveStreamPage />
                  </PageIn>
                </ErrorBoundary>
              }
            />
            <Route
              path="/stream/:eventId/:streamId"
              element={
                <ErrorBoundary>
                  <PageIn k="stream-id">
                    <LiveStreamPage />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Dashboard (requires auth) â”€â”€ */}
            <Route
              path="/dashboard"
              element={
                <ErrorBoundary>
                  <RequireAuth>
                    <PageIn k="dashboard">
                      <DashboardPage onBack={onBackHome} />
                    </PageIn>
                  </RequireAuth>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Gamification â”€â”€ */}
            <Route
              path="/gamification"
              element={
                <ErrorBoundary>
                  <PageIn k="gamification">
                    <GamificationDashboard />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Analytics â”€â”€ */}
            <Route
              path="/analytics"
              element={
                <ErrorBoundary>
                  <PageIn k="analytics">
                    <AnalyticsPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Projects â”€â”€ */}
            <Route
              path="/projects"
              element={
                <ErrorBoundary>
                  <PageIn k="projects">
                    <ProjectsPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Roadmaps â”€â”€ */}
            <Route
              path="/roadmaps"
              element={
                <ErrorBoundary>
                  <PageIn k="roadmaps">
                    <RoadmapsPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Portfolio Builder â”€â”€ */}
            <Route
              path="/portfolio"
              element={
                <ErrorBoundary>
                  <PageIn k="portfolio">
                    <PortfolioBuilder />
                  </PageIn>
                </ErrorBoundary>
              }
            />
            {/* â”€â”€ Public Portfolio â”€â”€ */}
            <Route
              path="/p/:username"
              element={
                <ErrorBoundary>
                  <PublicPortfolioWrapper onBack={onBackHome} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <ErrorBoundary>
                  <PublicPortfolioWrapper onBack={onBackHome} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/p/:username/analytics"
              element={
                <ErrorBoundary>
                  <PortfolioAnalyticsWrapper />
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ About â”€â”€ */}
            <Route
              path="/about"
              element={
                <ErrorBoundary>
                  <PageIn k="about">
                    <AboutPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Team â”€â”€ */}
            <Route
              path="/team"
              element={
                <ErrorBoundary>
                  <PageIn k="team">
                    <TeamPage onBack={onBackHome} onApply={openApply} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Contact â”€â”€ */}
            <Route
              path="/contact"
              element={
                <ErrorBoundary>
                  <PageIn k="contact">
                    <ContactPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Recruitment / Apply â”€â”€ */}
            <Route
              path="/apply"
              element={
                <ErrorBoundary>
                  <PageIn k="apply">
                    <RecruitmentPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Membership / Join â”€â”€ */}
            <Route
              path="/join"
              element={
                <ErrorBoundary>
                  <PageIn k="join">
                    <MembershipPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Certificate Verify â”€â”€ */}
            <Route
              path="/verify/:certId"
              element={
                <ErrorBoundary>
                  <CertVerifyWrapper onGoHome={onBackHome} />
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Workspace (collaborative room) â”€â”€ */}
            <Route
              path="/workspace/:roomId"
              element={
                <ErrorBoundary>
                  <WorkspaceWrapper onBack={onBackHome} />
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Forum â”€â”€ */}
            <Route
              path="/forum"
              element={
                <ErrorBoundary>
                  <PageIn k="forum">
                    <ForumPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />
            <Route
              path="/forum/:id"
              element={
                <ErrorBoundary>
                  <PageIn k="forum-thread">
                    <ForumThreadPage onBack={() => nav('/forum')} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Sponsors â”€â”€ */}
            <Route
              path="/sponsors"
              element={
                <PageIn k="sponsors">
                  <SponsorsPage />
                </PageIn>
              }
            />

            {/* â”€â”€ Mentorship â”€â”€ */}
            <Route
              path="/mentorship"
              element={
                <ErrorBoundary>
                  <PageIn k="mentorship">
                    <MentorsPage />
                  </PageIn>
                </ErrorBoundary>
              }
            />
            <Route
              path="/mentorship/mentors"
              element={
                <ErrorBoundary>
                  <PageIn k="mentorship-mentors">
                    <MentorsPage />
                  </PageIn>
                </ErrorBoundary>
              }
            />
            <Route
              path="/mentorship/dashboard"
              element={
                <ErrorBoundary>
                  <PageIn k="mentorship-dashboard">
                    <MentorshipDashboard />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* â”€â”€ Resources / Library â”€â”€ */}
            <Route
              path="/resources"
              element={
                <ErrorBoundary>
                  <PageIn k="resources">
                    <ResourcesPage onBack={onBackHome} />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* ── Recommendations ── */}
            <Route
              path="/recommendations"
              element={
                <PageIn k="recommendations">
                  <RecommendationsPage onBack={onBackHome} />
                </PageIn>
              }
            />
            {/* ── Notification History ── */}
            <Route
              path="/notifications"
              element={
                <PageIn k="notifications">
                  <NotificationHistoryPage />
                </PageIn>
              }
            />

            {/* ── Login / SSO ── */}
            <Route
              path="/login"
              element={
                <ErrorBoundary>
                  <PageIn k="login">
                    <LoginPage />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* ── Search Page ── */}
            <Route
              path="/search"
              element={
                <ErrorBoundary>
                  <PageIn k="search">
                    <SearchPage />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* ── Status Page ── */}
            <Route
              path="/status"
              element={
                <ErrorBoundary>
                  <PageIn k="status">
                    <StatusPage />
                  </PageIn>
                </ErrorBoundary>
              }
            />

            {/* ── Skill Exchange ── */}
            <Route
              path="/skill-exchange"
              element={
                <PageIn k="skill-exchange">
                  <SkillExchangePage />
                </PageIn>
              }
            />

            {/* ── 404 ── */}
            <Route path="*" element={<NotFoundPage onGoHome={onBackHome} />} />
          </Routes>
        </Suspense>
      </main>

      {cinDone && <MoveToTop />}

      {/* Floating search FAB */}
      {cinDone && (
        <button
          id="search-fab"
          onClick={() => setSearchOpen(true)}
          aria-label="Open search"
          title="Search (Ctrl+K)"
          style={{
            position: 'fixed',
            bottom: '80px',
            left: '24px',
            zIndex: 8500,
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg,#CC1111,#880000)',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(204,17,17,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.12)';
            e.currentTarget.style.boxShadow = '0 6px 28px rgba(204,17,17,0.75)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 20px rgba(204,17,17,0.5)';
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
      )}

      <SearchBar
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
        activities={activityPages}
        events={eventsData}
        onNavigate={onNavigate}
        onEventClick={onKSSClick}
      />

      <Terminal
        isOpen={isTerminalOpen}
        onClose={closeTerminal}
        theme={theme}
        setTheme={() => {}}
        onNavigate={onTab}
      />

      <BookmarksDrawer
        isOpen={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        onNavigate={(type) => {
          if (type === 'Event') onTab('Events');
          else if (type === 'Activity') onTab('Activities');
          else if (type === 'Roadmap') onTab('Roadmaps');
        }}
      />
      {cinDone && <FloatingDock />}
    </SessionRecordingProvider>
  );
}

/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
   Route wrapper components (URL param readers)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */

function ActivityDetailWrapper({ onBack, onSelectEvent }) {
  const { activityKey } = useParams();
  const decoded = decodeURIComponent(activityKey || '');
  const activity = activityPages[decoded];
  if (!activity) return <NotFoundPage onGoHome={onBack} />;
  return (
    <PageIn k={`activity-${decoded}`}>
      <ActivityDetailPage activity={activity} onBack={onBack} onSelectEvent={onSelectEvent} />
    </PageIn>
  );
}

function EventDetailWrapper({ onBack, events }) {
  const { eventId } = useParams();

  // 1. Look for a matching rich event in the activity pages conductedEvents
  let event = null;
  let activityColor = null;
  let activityIcon = null;

  for (const act of Object.values(activityPages)) {
    const found = (act.conductedEvents || []).find(
      (e) =>
        String(e.id) === eventId ||
        encodeURIComponent(e.name || '') === eventId ||
        encodeURIComponent(e.shortName || '') === eventId
    );
    if (found) {
      event = found;
      activityColor = act.color;
      activityIcon = act.icon;
      break;
    }
  }

  // 2. If not found in rich conductedEvents, fall back to basic events list
  if (!event) {
    event = (events || []).find(
      (e) =>
        String(e.id) === eventId ||
        encodeURIComponent(e.name || '') === eventId ||
        encodeURIComponent(e.shortName || '') === eventId
    );
  }

  if (!event) return <NotFoundPage onGoHome={onBack} />;

  // Render with correct styling if resolved
  const iconElement = activityIcon ? (
    <DynamicIcon
      name={activityIcon}
      size={13}
      style={{ marginRight: '4px', verticalAlign: '-1px' }}
    />
  ) : null;

  return (
    <PageIn k={`event-${eventId}`}>
      <EventDetailPage
        event={event}
        activityColor={activityColor}
        activityIcon={iconElement}
        onBack={onBack}
      />
    </PageIn>
  );
}

function PublicPortfolioWrapper({ onBack }) {
  const { username } = useParams();
  return (
    <PageIn k={`portfolio-${username}`}>
      <PublicPortfolio username={username} onBack={onBack} />
    </PageIn>
  );
}

function PortfolioAnalyticsWrapper() {
  const { username } = useParams();
  return (
    <PageIn k={`portfolio-analytics-${username}`}>
      <PortfolioAnalytics username={username} />
    </PageIn>
  );
}
function CertVerifyWrapper({ onGoHome }) {
  const { certId } = useParams();
  return <CertificateVerifyPage certificateId={certId} onGoHome={onGoHome} />;
}

function WorkspaceWrapper({ onBack }) {
  const { roomId } = useParams();
  return (
    <PageIn k={`workspace-${roomId}`}>
      <WorkspacePage roomId={roomId} onBack={onBack} />
    </PageIn>
  );
}

function EventPlanningWrapper({ onBack }) {
  const { eventId } = useParams();
  return (
    <PageIn k={`event-planning-${eventId}`}>
      <EventPlanningPage event={{ id: eventId, eventId }} onBack={onBack} />
    </PageIn>
  );
}

/* ─────────────────────────────────────────────────────
   Page loading spinner (Suspense fallback)
â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function PageLoadingSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: 'var(--t2)',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          border: '3px solid rgba(204,17,17,0.2)',
          borderTop: '3px solid #CC1111',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <span style={{ fontSize: '0.85rem', opacity: 0.6 }}>Loadingâ€¦</span>
    </div>
  );
}
