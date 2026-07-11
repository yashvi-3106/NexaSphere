# TODO - Advanced User Profile (Skills Graph + Contributions + Endorsements)

## Phase 1 — Thin vertical slice: `GET /api/auth/profile/advanced`

- [x] Inspect existing profile routes and DB access patterns
- [x] Add DB tables for advanced profile (skills, contributions, endorsements, privacy prefs, summary) via server migrations
- [ ] Implement repository layer to read advanced profile aggregates
- [x] Implement controller endpoint `GET /api/auth/profile/advanced`
- [x] Add frontend page/section to consume endpoint (placeholder UI accepted for slice)
- [x] Add Playwright/e2e test for endpoint shape + privacy redaction (auth-specific)

## Phase 2 — Skills graph rendering

- [ ] Implement radar/spider chart grouped by category
- [ ] Implement growth over time line chart
- [ ] Implement peer anonymized comparison
- [ ] Wire skill level scoring inputs (self-assessment, endorsements, event attendance, quiz scores)

## Phase 3 — Contribution heatmap + timeline

- [ ] Implement contribution heatmap with streak + YoY comparison
- [ ] Implement activity timeline filters + milestone highlighting

## Phase 4 — Endorsements + notifications

- [ ] Implement endorse/request flow
- [ ] Mentor weight handling
- [ ] Notification UI + backend feed

## Phase 5 — Professional summary + PDF export

- [ ] Auto-generated summary + editable field
- [ ] PDF export endpoint + frontend export trigger
- [ ] LinkedIn integration stub/sync

## Phase 6 — Privacy enforcement + GDPR export

- [ ] Backend privacy enforcement rules
- [ ] Anonymous mode behavior
- [ ] Personal data export (GDPR)

## Phase 7 — QA & performance

- [ ] Mobile responsive verification
- [ ] Large dataset performance optimization
- [ ] QA tests with multiple datasets
