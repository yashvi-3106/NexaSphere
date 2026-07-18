# TODO - Implement #1806 Cross-Platform Mobile App (React Native - Expo)

## Phase 1: Repo/Scaffolding

- [ ] Create plan + confirm approach (Expo) (approved)
- [ ] Add `mobile/` Expo workspace (TypeScript, React Native 0.72+)
- [ ] Wire `mobile` into root `package.json` workspaces + scripts
- [ ] Add `mobile` README with run/test instructions

## Phase 2: Required Feature Stack

- [ ] Add Redux Toolkit store + slices (basic app state)
- [ ] Add React Navigation (stack) with example screens
- [ ] Add offline persistence using `@react-native-async-storage/async-storage`
- [ ] Add offline queue/outbox-lite for delayed requests
- [ ] Create API client (fetch) hitting existing server endpoints

## Phase 3: Maintainer Quality Requirements

- [ ] Unit tests setup (Jest + React Native Testing Library)
- [ ] Add tests and ensure coverage >= 70%
- [ ] Add performance guard patterns (FlatList memoization, avoid re-renders)
- [ ] Add accessibility labels/roles for key UI
- [ ] Add platform-specific UI tweaks (Platform.select)

## Phase 4: CI/Test

- [ ] Ensure root `npm test` / lint / typecheck not broken
- [ ] Add `npm run test:mobile` and `npm run lint:mobile` scripts
- [ ] Run tests locally and fix failures
