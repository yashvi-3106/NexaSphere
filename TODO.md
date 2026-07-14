# TODO — PWA Offline Support (#1743)

- [x] Verify current PWA build SW setup and identify push subscription entrypoints (found SW + offline queue/sync + install/update UI)
- [x] Verify missing push subscription wiring (no push subscribe flow found yet)
- [x] Implement push subscription flow (permissions + subscribe + store subscription endpoint) and notification badge/action handling

- [ ] Update service worker (`website/src/sw-nexasphere.js`) to persist/caches key dynamic reads longer (events, announcements, leaderboard, profile, portfolio)
- [ ] Ensure dynamic offline reads fall back to IndexedDB when offline
- [ ] Audit `setupFetchInterceptor()` and confirm offline draft registration enqueues via `enqueueRequest()`
- [ ] Ensure background sync replay works for queued registrations (manual + SW-triggered)
- [ ] Validate update management flow (prompt/reload behavior) doesn’t interrupt active session
- [ ] Run website build + unit tests
- [ ] Run e2e tests that cover offline/registration flows (if feasible)
