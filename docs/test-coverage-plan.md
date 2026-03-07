# Test Coverage Plan

> Baseline coverage analysis and phased plan for improving test coverage across
> the course platform. Generated 2026-03-07.

## Coverage Baseline

### Overall Summary

| App | Statements | Branches | Functions | Lines | Test Files |
| --- | --- | --- | --- | --- | --- |
| **Server** | 4.67% (146/3121) | 3% (35/1164) | 8.2% (60/731) | 4.27% (130/3040) | 7 |
| **Web** | 11.04% (503/4555) | 8.49% (269/3166) | 5.75% (76/1320) | 10.32% (419/4059) | 20 |

### Server (`apps/server`) — 4.27% Line Coverage

**137 total files: 129 untested, 3 partial, 5 fully covered**

#### Server Coverage by Area

| Area | Files Tested | Line Coverage | Lines |
| --- | --- | --- | --- |
| tRPC Routers (17 modules) | 0/42 | 0% | 0/1474 |
| REST Routes (3 modules) | 0/16 | 0% | 0/328 |
| DB Queries | 0/9 | 0% | 0/143 |
| DB Mutations | 0/9 | 0% | 0/117 |
| DB Schema | 0/17 | 0% | 0/207 |
| Plugins | 0/17 | 0% | 0/98 |
| Lib | 6/16 | 35.9% | 110/306 |
| Server bootstrap | 0/4 | 0% | 0/75 |

#### Server — Fully Covered Files

- `src/config.ts` — 100%
- `src/hooks/authHooks.ts` — 100%
- `src/lib/constants.ts` — 100%
- `src/lib/normalized-route.ts` — 100%
- `src/lib/notifications.ts` — 100%

#### Server — Partially Covered Files

| File | Lines | Branches |
| --- | --- | --- |
| `src/lib/logging.ts` | 20% | 0% |
| `src/lib/sse-sync.ts` | 33% | 29% |
| `src/lib/metrics.ts` | 72% | 0% |

#### Server — Untested Files (0% Coverage)

<details>
<summary>129 files with zero coverage (click to expand)</summary>

**Bootstrap & Core:**

- `src/context.ts`
- `src/index.ts`
- `src/router.ts`
- `src/server.ts`

**Database — Schema (17 files):**

- `src/db/index.ts`
- `src/db/my-schema.ts`
- `src/db/schema/chatMessageReports.ts`
- `src/db/schema/columns.helpers.ts`
- `src/db/schema/coupon.ts`
- `src/db/schema/course.ts`
- `src/db/schema/directMessages.ts`
- `src/db/schema/earlySignup.ts`
- `src/db/schema/enrollment.ts`
- `src/db/schema/gdprAudit.ts`
- `src/db/schema/index.ts`
- `src/db/schema/platformAnnouncements.ts`
- `src/db/schema/progress.ts`
- `src/db/schema/purchase.ts`
- `src/db/schema/support-tickets.ts`
- `src/db/schema/syncStatus.ts`
- `src/db/schema/teamLicense.ts`
- `src/db/schema/user.ts`
- `src/db/schema/userNotifications.ts`

**Database — Queries (9 files):**

- `src/db/queries/courseWishlist.ts`
- `src/db/queries/gdprAudit.ts`
- `src/db/queries/index.ts`
- `src/db/queries/invoice.ts`
- `src/db/queries/payment.ts`
- `src/db/queries/platformAnnouncements.ts`
- `src/db/queries/stats.ts`
- `src/db/queries/teamLicense.ts`
- `src/db/queries/user.ts`

**Database — Mutations (9 files):**

- `src/db/mutations/courseWishlist.ts`
- `src/db/mutations/gdprAudit.ts`
- `src/db/mutations/index.ts`
- `src/db/mutations/invoice.ts`
- `src/db/mutations/payment.ts`
- `src/db/mutations/platformAnnouncements.ts`
- `src/db/mutations/session.ts`
- `src/db/mutations/teamLicense.ts`
- `src/db/mutations/teamLicenseInvite.ts`

**Lib (10 untested files):**

- `src/lib/auth-metrics.ts`
- `src/lib/auth.server.ts`
- `src/lib/cache.ts`
- `src/lib/chat-metrics.ts`
- `src/lib/db-metrics.ts`
- `src/lib/external-metrics.ts`
- `src/lib/mailer.ts`
- `src/lib/r2-upload.ts`
- `src/lib/redis.ts`
- `src/lib/trpc-metrics.ts`

**Plugins — App (6 files):**

- `src/plugins/app/cache.ts`
- `src/plugins/app/db.ts`
- `src/plugins/app/mail.ts`
- `src/plugins/app/metrics.ts`
- `src/plugins/app/request-logging.ts`
- `src/plugins/app/timingHeader.ts`

**Plugins — External (11 files):**

- `src/plugins/external/allow.ts`
- `src/plugins/external/better-auth.ts`
- `src/plugins/external/cors.ts`
- `src/plugins/external/etag.ts`
- `src/plugins/external/favicons.ts`
- `src/plugins/external/form-body.ts`
- `src/plugins/external/healthcheck.ts`
- `src/plugins/external/helmet.ts`
- `src/plugins/external/multipart.ts`
- `src/plugins/external/rate-limit.ts`
- `src/plugins/external/sensible.ts`

**tRPC Routers (42 files):**

- `src/routers/index.ts`
- `src/routers/announcements/index.ts`
- `src/routers/audit/index.ts`
- `src/routers/chat/dmValidation.ts`
- `src/routers/chat/index.ts`
- `src/routers/chat/queries.ts`
- `src/routers/chatReports/index.ts`
- `src/routers/chatReports/mutations.ts`
- `src/routers/chatReports/queries.ts`
- `src/routers/coupons/index.ts`
- `src/routers/coupons/mutations.ts`
- `src/routers/coupons/queries.ts`
- `src/routers/courseWishlist/index.ts`
- `src/routers/courses/index.ts`
- `src/routers/courses/mutations.ts`
- `src/routers/courses/queries.ts`
- `src/routers/dataExport/csvUtils.ts`
- `src/routers/dataExport/index.ts`
- `src/routers/dataExport/queries.ts`
- `src/routers/dataExport/rateLimit.ts`
- `src/routers/directMessages/index.ts`
- `src/routers/directMessages/mutations.ts`
- `src/routers/directMessages/queries.ts`
- `src/routers/images/index.ts`
- `src/routers/mentions/index.ts`
- `src/routers/notifications/index.ts`
- `src/routers/notifications/mutations.ts`
- `src/routers/notifications/queries.ts`
- `src/routers/purchases/index.ts`
- `src/routers/purchases/mutations.ts`
- `src/routers/purchases/queries.ts`
- `src/routers/reviews/index.ts`
- `src/routers/reviews/mutations.ts`
- `src/routers/reviews/queries.ts`
- `src/routers/stats/index.ts`
- `src/routers/support-tickets/index.ts`
- `src/routers/support-tickets/mutations.ts`
- `src/routers/support-tickets/queries.ts`
- `src/routers/supportStatus/index.ts`
- `src/routers/supportStatus/queries.ts`
- `src/routers/syncStatus/index.ts`
- `src/routers/syncStatus/mutations.ts`
- `src/routers/syncStatus/queries.ts`
- `src/routers/users/index.ts`

**REST Routes (16 files):**

- `src/routes/courses/index.ts`
- `src/routes/courses/mutations.ts`
- `src/routes/courses/queries.ts`
- `src/routes/courses/handlers/createCourse.ts`
- `src/routes/courses/handlers/deleteCourseById.ts`
- `src/routes/courses/handlers/getCourseById.ts`
- `src/routes/courses/handlers/getCourses.ts`
- `src/routes/courses/handlers/updateCourseById.ts`
- `src/routes/platform-announcements/index.ts`
- `src/routes/sessions/index.ts`
- `src/routes/team-licenses/index.ts`
- `src/routes/team-licenses/handlers/createNewTeamLicense.ts`
- `src/routes/team-licenses/handlers/createNewTeamLicenseInvite.ts`
- `src/routes/team-licenses/handlers/deleteTeamLicense.ts`
- `src/routes/team-licenses/handlers/deleteTeamLicenseInvite.ts`
- `src/routes/team-licenses/handlers/updateTeamLicense.ts`
- `src/routes/team-licenses/handlers/updateTeamLicenseInvite.ts`

</details>

---

### Web (`apps/web`) — 10.32% Line Coverage

**214 total files: 175 untested, 20 partial, 19 fully covered**

#### Web Coverage by Area

| Area | Files Tested | Line Coverage | Lines |
| --- | --- | --- | --- |
| Components | 5/47 | 4.1% | 76/1870 |
| Forms | 0/13 | 0% | 0/303 |
| Hooks | 0/1 | 0% | 0/327 |
| Lib/Collections | 1/36 | 1.8% | 5/276 |
| Lib | 6/14 | 15.1% | 73/482 |
| Components/UI | 1/15 | 0.9% | 1/116 |
| Markdown Editor | 9/14 | 54.9% | 237/432 |
| Routes (all) | 0/52 | 0% | 0/166 |
| Schema | 17/17 | 100% | 27/27 |

#### Web — Fully Covered Files (19)

- `src/lib/query.client.ts` — 100%
- `src/lib/utils.ts` — 100%
- `src/schema/change-email.ts` — 100%
- `src/schema/change-password.ts` — 100%
- `src/schema/course.ts` — 100%
- `src/schema/create-coupon.ts` — 100%
- `src/schema/create-review.ts` — 100%
- `src/schema/edit-coupon.ts` — 100%
- `src/schema/edit-review.ts` — 100%
- `src/schema/edit-user.ts` — 100%
- `src/schema/lesson.ts` — 100%
- `src/schema/module.ts` — 100%
- `src/schema/password-reset.ts` — 100%
- `src/schema/profile-form.ts` — 100%
- `src/schema/refund-purchase.ts` — 100%
- `src/schema/request-password-reset.ts` — 100%
- `src/schema/sign-in.ts` — 100%
- `src/schema/sign-up.ts` — 100%
- `src/schema/support-ticket.ts` — 100%

#### Web — Partially Covered Files

| File | Lines | Branches |
| --- | --- | --- |
| `src/components/markdown-editor/components/file-upload-footer.tsx` | 95% | 75% |
| `src/components/markdown-editor/components/editor-toolbar.tsx` | 94% | 50% |
| `src/components/markdown-editor/components/editor-tabs.tsx` | 94% | 66% |
| `src/components/markdown-editor/github-message-editor.tsx` | 85% | 66% |
| `src/lib/collapsed-media.ts` | 75% | 81% |
| `src/components/markdown-editor/formatting/text-utils.ts` | 62% | 33% |
| `src/lib/trpc.client.ts` | 57% | 100% |
| `src/components/markdown-editor/hooks/use-markdown-preview.ts` | 56% | 100% |
| `src/components/notifications-bell.tsx` | 56% | 27% |
| `src/components/markdown-editor/formatting/handlers.ts` | 55% | 29% |
| `src/components/message-reactions.tsx` | 40% | 23% |
| `src/components/markdown-editor/hooks/use-mention-picker.ts` | 40% | 62% |
| `src/lib/collections/utils.ts` | 28% | 33% |
| `src/lib/attachments.ts` | 27% | 16% |
| `src/lib/rehype-media-embed.ts` | 23% | 11% |
| `src/components/SyncStatusIndicator.tsx` | 13% | 10% |
| `src/components/ui/button.tsx` | 13% | 0% |
| `src/components/course-card.tsx` | 11% | 3% |
| `src/components/markdown-editor/hooks/use-file-upload.ts` | 6% | 0% |
| `src/components/emoji-reaction-picker.tsx` | 4% | 0% |

#### Web — Untested Files (0% Coverage)

<details>
<summary>175 files with zero coverage (click to expand)</summary>

**App Bootstrap:**

- `src/main.tsx`
- `src/reportWebVitals.ts`

**Components (45 files):**

- `src/components/auth-links.tsx`
- `src/components/blocker.tsx`
- `src/components/chat-date-divider.tsx`
- `src/components/chat-message-editor.tsx`
- `src/components/chat-message.tsx`
- `src/components/code-block-copy.tsx`
- `src/components/confirm-dialog.tsx`
- `src/components/course-editor-sidebar.tsx`
- `src/components/create-coupon-sheet.tsx`
- `src/components/create-course-sheet.tsx`
- `src/components/create-review-sheet.tsx`
- `src/components/cta-section.tsx`
- `src/components/dm-request-modal.tsx`
- `src/components/dm-request-sheet.tsx`
- `src/components/edit-coupon-sheet.tsx`
- `src/components/edit-course-sheet.tsx`
- `src/components/edit-message-sheet.tsx`
- `src/components/edit-user-sheet.tsx`
- `src/components/empty-state.tsx`
- `src/components/error-boundary.tsx`
- `src/components/field-info.tsx`
- `src/components/file-attachment.tsx`
- `src/components/footer.tsx`
- `src/components/giphy-picker.tsx`
- `src/components/header.tsx`
- `src/components/instructor-card.tsx`
- `src/components/loading.tsx`
- `src/components/markdown-content.tsx`
- `src/components/mention-picker.tsx`
- `src/components/not-found.tsx`
- `src/components/pricing-section.tsx`
- `src/components/refund-purchase-modal.tsx`
- `src/components/report-message-dialog.tsx`
- `src/components/review-details-sheet.tsx`
- `src/components/support-comment.tsx`
- `src/components/theme-toggle.tsx`
- `src/components/thread-panel.tsx`
- `src/components/user-profile-sheet.tsx`
- `src/components/user-search-modal.tsx`
- `src/components/username-requirement-modal.tsx`
- `src/components/video-player.tsx`
- `src/components/view-purchase-sheet.tsx`
- `src/components/announcements/AnnouncementsBanner.tsx`

**Forms (13 files):**

- `src/components/forms/change-email-form.tsx`
- `src/components/forms/change-password-form.tsx`
- `src/components/forms/chat-message-form.tsx`
- `src/components/forms/course-redemption-form.tsx`
- `src/components/forms/create-course-form.tsx`
- `src/components/forms/create-support-comment-form.tsx`
- `src/components/forms/create-support-ticket-form.tsx`
- `src/components/forms/delete-account-form.tsx`
- `src/components/forms/password-reset-form.tsx`
- `src/components/forms/profile-form.tsx`
- `src/components/forms/request-password-reset-form.tsx`
- `src/components/forms/sign-in-form.tsx`
- `src/components/forms/sign-up-form.tsx`

**Layouts:**

- `src/components/layouts/admin-layout.tsx`
- `src/components/layouts/default-layout.tsx`

**Markdown Editor (5 untested files):**

- `src/components/markdown-editor/index.ts`
- `src/components/markdown-editor/types.ts`
- `src/components/markdown-editor/components/index.ts`
- `src/components/markdown-editor/formatting/index.ts`
- `src/components/markdown-editor/hooks/index.ts`

**UI Components (14 files):**

- `src/components/ui/card.tsx`
- `src/components/ui/dropdown-menu.tsx`
- `src/components/ui/form-status-message.tsx`
- `src/components/ui/input.tsx`
- `src/components/ui/label.tsx`
- `src/components/ui/menu.tsx`
- `src/components/ui/nav-link.tsx`
- `src/components/ui/number-field.tsx`
- `src/components/ui/section.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/sonner.tsx`
- `src/components/ui/submit-button.tsx`
- `src/components/ui/table.tsx`
- `src/components/ui/text-field.tsx`

**Hooks:**

- `src/hooks/useSseSync.ts`

**Lib (8 untested files):**

- `src/lib/auth.client.ts`
- `src/lib/auth.context.ts`
- `src/lib/auth.provider.tsx`
- `src/lib/db.collections.ts`
- `src/lib/form.context.tsx`
- `src/lib/markdown.ts`
- `src/lib/theme.context.ts`
- `src/lib/theme.provider.tsx`

**Lib/Collections (35 untested files):**

- `src/lib/collections/index.ts`
- `src/lib/collections/types.ts`
- `src/lib/collections/announcements/announcements.collection.ts`
- `src/lib/collections/announcements/hooks.ts`
- `src/lib/collections/announcements/index.ts`
- `src/lib/collections/chat-messages/chat-messages.collection.ts`
- `src/lib/collections/chat-messages/index.ts`
- `src/lib/collections/chat-reports/chat-reports.collection.ts`
- `src/lib/collections/chat-reports/hooks.ts`
- `src/lib/collections/chat-reports/index.ts`
- `src/lib/collections/coupons/coupons.collection.ts`
- `src/lib/collections/coupons/hooks.ts`
- `src/lib/collections/coupons/index.ts`
- `src/lib/collections/courses/courses.collection.ts`
- `src/lib/collections/courses/hooks.ts`
- `src/lib/collections/courses/index.ts`
- `src/lib/collections/gdpr-audit-logs/gdpr-audit-logs.collection.ts`
- `src/lib/collections/gdpr-audit-logs/hooks.ts`
- `src/lib/collections/gdpr-audit-logs/index.ts`
- `src/lib/collections/notifications/hooks.ts`
- `src/lib/collections/notifications/index.ts`
- `src/lib/collections/purchases/index.ts`
- `src/lib/collections/purchases/purchases.collection.ts`
- `src/lib/collections/reviews/hooks.ts`
- `src/lib/collections/reviews/index.ts`
- `src/lib/collections/reviews/reviews.collection.ts`
- `src/lib/collections/searchable-users/hooks.ts`
- `src/lib/collections/searchable-users/index.ts`
- `src/lib/collections/searchable-users/searchable-users.collection.ts`
- `src/lib/collections/support-tickets/hooks.ts`
- `src/lib/collections/support-tickets/index.ts`
- `src/lib/collections/support-tickets/support-tickets.collection.ts`
- `src/lib/collections/sync-status/hooks.ts`
- `src/lib/collections/sync-status/index.ts`
- `src/lib/collections/sync-status/sync-status.collection.ts`

**Routes — Public (7 files):**

- `src/routes/__root.tsx`
- `src/routes/cookies.tsx`
- `src/routes/downloads.tsx`
- `src/routes/index.tsx`
- `src/routes/privacy.tsx`
- `src/routes/terms.tsx`
- `src/routes/blog/$slug.tsx`
- `src/routes/blog/index.tsx`
- `src/routes/education/courses/index.tsx`
- `src/routes/education/courses/route.tsx`
- `src/routes/education/courses/$course/index.tsx`
- `src/routes/education/courses/$course/route.tsx`

**Routes — Auth (4 files):**

- `src/routes/(auth)/reset-password.tsx`
- `src/routes/(auth)/route.tsx`
- `src/routes/(auth)/signin.tsx`
- `src/routes/(auth)/signup.tsx`
- `src/routes/(auth)/verify-email.$token.tsx`

**Routes — Authenticated (11 files):**

- `src/routes/_authenticated/account.tsx`
- `src/routes/_authenticated/chat.$channelId.tsx`
- `src/routes/_authenticated/chat.dm.$conversationId.tsx`
- `src/routes/_authenticated/chat.support.$courseSlug.tsx`
- `src/routes/_authenticated/chat.support.new.tsx`
- `src/routes/_authenticated/chat.tsx`
- `src/routes/_authenticated/courses.$courseId.lessons.$lessonId.tsx`
- `src/routes/_authenticated/courses.$courseId.lessons.tsx`
- `src/routes/_authenticated/courses.$courseId.tsx`
- `src/routes/_authenticated/dashboard.tsx`
- `src/routes/_authenticated/data-export.tsx`
- `src/routes/_authenticated/profile.tsx`
- `src/routes/_authenticated/purchases.tsx`
- `src/routes/_authenticated/route.tsx`
- `src/routes/_authenticated/sync-status.tsx`

**Routes — Admin (10 files):**

- `src/routes/_authenticated/admin/announcements.tsx`
- `src/routes/_authenticated/admin/audit.tsx`
- `src/routes/_authenticated/admin/chat-reports.tsx`
- `src/routes/_authenticated/admin/courses.faq.tsx`
- `src/routes/_authenticated/admin/courses.instructor-notes.tsx`
- `src/routes/_authenticated/admin/purchases.tsx`
- `src/routes/_authenticated/admin/reviews.tsx`
- `src/routes/_authenticated/admin/route.tsx`
- `src/routes/_authenticated/admin/stats.tsx`
- `src/routes/_authenticated/admin/users.tsx`
- `src/routes/_authenticated/admin/coupons/index.tsx`
- `src/routes/_authenticated/admin/courses/create.tsx`
- `src/routes/_authenticated/admin/courses/index.tsx`
- `src/routes/_authenticated/admin/courses/$courseId/edit.tsx`

**Routes — Support (5 files):**

- `src/routes/support/create-ticket.tsx`
- `src/routes/support/index.tsx`
- `src/routes/support/route.tsx`
- `src/routes/support/$supportTicket/index.tsx`
- `src/routes/support/$supportTicket/edit/index.tsx`
- `src/routes/support/$supportTicket/edit/route.tsx`

</details>

---

### Cypress E2E Tests — 17 Spec Files

#### Features Covered by E2E

- `spec.cy.ts` — Home page, Terms, Privacy, Sign Up, Sign In
- `navigation-and-guards.cy.ts` — Auth guards, public page access, cross-page navigation
- `auth-forms.cy.ts` — Sign In/Sign Up form validation
- `reset-password.cy.ts` — Password reset flow
- `dashboard.cy.ts` — Dashboard page and navigation
- `profile.cy.ts` — Profile page
- `account.cy.ts` — Account management
- `data-export.cy.ts` — Data export page
- `downloads.cy.ts` — Downloads page
- `cookie-policy.cy.ts` — Cookie policy page
- `chat-support-tickets.cy.ts` — Chat username, support tickets, chat access
- `admin-navigation.cy.ts` — Admin navigation and access control
- `admin-stats.cy.ts` — Admin stats dashboard
- `admin-courses.cy.ts` — Admin courses management
- `admin-course-editor.cy.ts` — Admin course editor
- `admin-course-creation-flow.cy.ts` — Admin course creation flow
- `admin-announcements.cy.ts` — Admin announcements management

#### Features NOT Covered by E2E

- Course enrollment and lesson viewing
- Purchases and payments flow
- Course reviews
- Coupon management (admin)
- Notifications
- Direct messages
- User search and mentions
- Blog pages
- Sync status page
- Theme toggling (dark/light mode)

---

## Test Plan — Phased Implementation

### Phase 1: Server Business Logic (Highest ROI)

These are the largest untested areas containing core business logic.

| # | Test to Create | Target | Lines | Status |
| --- | --- | --- | --- | --- |
| 1 | `src/routers/courses/__tests__/queries.test.ts` | Course queries | 267 | - [ ] Todo |
| 2 | `src/routers/courses/__tests__/mutations.test.ts` | Course mutations | — | - [ ] Todo |
| 3 | `src/routers/reviews/__tests__/queries.test.ts` | Review queries | 174 | - [ ] Todo |
| 4 | `src/routers/reviews/__tests__/mutations.test.ts` | Review mutations | — | - [ ] Todo |
| 5 | `src/routers/chat/__tests__/queries.test.ts` | Chat queries | 286 | - [ ] Todo |
| 6 | `src/routers/support-tickets/__tests__/queries.test.ts` | Ticket queries | 115 | - [ ] Todo |
| 7 | `src/routers/support-tickets/__tests__/mutations.test.ts` | Ticket mutations | — | - [ ] Todo |
| 8 | `src/routers/purchases/__tests__/queries.test.ts` | Purchase queries | 80 | - [ ] Todo |
| 9 | `src/routers/purchases/__tests__/mutations.test.ts` | Purchase mutations | — | - [ ] Todo |
| 10 | `src/routers/coupons/__tests__/queries.test.ts` | Coupon queries | 109 | - [ ] Todo |
| 11 | `src/routers/coupons/__tests__/mutations.test.ts` | Coupon mutations | — | - [ ] Todo |
| 12 | `src/routers/dataExport/__tests__/csvUtils.test.ts` | CSV utility functions | 116 | - [ ] Todo |
| 13 | `src/routers/dataExport/__tests__/rateLimit.test.ts` | Rate limit logic | — | - [ ] Todo |
| 14 | `src/routers/directMessages/__tests__/queries.test.ts` | DM queries | 171 | - [ ] Todo |
| 15 | `src/routers/directMessages/__tests__/mutations.test.ts` | DM mutations | — | - [ ] Todo |
| 16 | `src/routers/notifications/__tests__/queries.test.ts` | Notification queries | 69 | - [ ] Todo |
| 17 | `src/routers/notifications/__tests__/mutations.test.ts` | Notification mutations | — | - [ ] Todo |

### Phase 2: Server DB and Infrastructure

| # | Test to Create | Target | Lines | Status |
| --- | --- | --- | --- | --- |
| 18 | `src/db/queries/__tests__/*.test.ts` | All DB query files | 143 | - [ ] Todo |
| 19 | `src/db/mutations/__tests__/*.test.ts` | All DB mutation files | 117 | - [ ] Todo |
| 20 | `src/routers/chat/__tests__/dmValidation.test.ts` | DM validation logic | — | - [ ] Todo |
| 21 | `src/lib/tests/logging.test.ts` | Logging (currently 20%) | 306 | - [ ] Todo |
| 22 | `src/lib/tests/cache.test.ts` | Cache module | — | - [ ] Todo |
| 23 | `src/lib/tests/mailer.test.ts` | Email sending | — | - [ ] Todo |
| 24 | `src/routes/courses/__tests__/handlers.test.ts` | REST course handlers | 150 | - [ ] Todo |
| 25 | `src/routers/chatReports/__tests__/*.test.ts` | Chat reports | 68 | - [ ] Todo |
| 26 | `src/routers/announcements/__tests__/index.test.ts` | Announcements router | 66 | - [ ] Todo |
| 27 | `src/routers/stats/__tests__/index.test.ts` | Stats router | 61 | - [ ] Todo |
| 28 | `src/routers/mentions/__tests__/index.test.ts` | Mentions router | 46 | - [ ] Todo |

### Phase 3: Web Components (Highest Untested Line Count)

| # | Test to Create | Target | Lines | Status |
| --- | --- | --- | --- | --- |
| 29 | `src/hooks/__tests__/useSseSync.test.ts` | SSE sync hook | 327 | - [ ] Todo |
| 30 | `src/components/__tests__/header.test.tsx` | Header component | — | - [ ] Todo |
| 31 | `src/components/__tests__/footer.test.tsx` | Footer component | — | - [ ] Todo |
| 32 | `src/components/__tests__/error-boundary.test.tsx` | Error boundary | — | - [ ] Todo |
| 33 | `src/components/__tests__/confirm-dialog.test.tsx` | Confirm dialog | — | - [ ] Todo |
| 34 | `src/components/__tests__/video-player.test.tsx` | Video player | — | - [ ] Todo |
| 35 | `src/components/__tests__/course-card.test.tsx` | Course card (11%) | — | - [ ] Todo |
| 36 | `src/components/__tests__/theme-toggle.test.tsx` | Theme toggle | — | - [ ] Todo |
| 37 | `src/components/__tests__/loading.test.tsx` | Loading component | — | - [ ] Todo |
| 38 | `src/components/__tests__/empty-state.test.tsx` | Empty state | — | - [ ] Todo |
| 39 | `src/components/__tests__/chat-message.test.tsx` | Chat message | — | - [ ] Todo |
| 40 | `src/components/__tests__/code-block-copy.test.tsx` | Code block copy | — | - [ ] Todo |

### Phase 4: Web Forms and UI Components

| # | Test to Create | Target | Lines | Status |
| --- | --- | --- | --- | --- |
| 41 | `src/components/forms/__tests__/sign-in-form.test.tsx` | Sign in form | 303 total | - [ ] Todo |
| 42 | `src/components/forms/__tests__/sign-up-form.test.tsx` | Sign up form | — | - [ ] Todo |
| 43 | `src/components/forms/__tests__/profile-form.test.tsx` | Profile form | — | - [ ] Todo |
| 44 | `src/components/forms/__tests__/create-course-form.test.tsx` | Course creation form | — | - [ ] Todo |
| 45 | `src/components/forms/__tests__/create-support-ticket-form.test.tsx` | Support ticket form | — | - [ ] Todo |
| 46 | `src/components/forms/__tests__/change-password-form.test.tsx` | Change password form | — | - [ ] Todo |
| 47 | `src/components/forms/__tests__/change-email-form.test.tsx` | Change email form | — | - [ ] Todo |
| 48 | `src/lib/__tests__/auth.client.test.ts` | Auth client | — | - [ ] Todo |
| 49 | `src/lib/__tests__/markdown.test.ts` | Markdown utils | — | - [ ] Todo |

### Phase 5: Missing E2E Tests

| # | Test to Create | Target | Status |
| --- | --- | --- | --- |
| 50 | `cypress/e2e/course-enrollment.cy.ts` | Course enrollment and lesson viewing | - [ ] Todo |
| 51 | `cypress/e2e/purchases.cy.ts` | Purchases flow | - [ ] Todo |
| 52 | `cypress/e2e/reviews.cy.ts` | Course reviews | - [ ] Todo |
| 53 | `cypress/e2e/notifications.cy.ts` | Notifications | - [ ] Todo |
| 54 | `cypress/e2e/coupons.cy.ts` | Coupon management | - [ ] Todo |
| 55 | `cypress/e2e/blog.cy.ts` | Blog pages | - [ ] Todo |
| 56 | `cypress/e2e/direct-messages.cy.ts` | Direct messages | - [ ] Todo |
| 57 | `cypress/e2e/theme-toggle.cy.ts` | Theme toggling | - [ ] Todo |

### Phase 6: Improve Partial Coverage

| # | File | Current Lines | Current Branches | Status |
| --- | --- | --- | --- | --- |
| 58 | `src/lib/rehype-media-embed.ts` | 23% | 11% | - [ ] Todo |
| 59 | `src/lib/attachments.ts` | 27% | 16% | - [ ] Todo |
| 60 | `src/lib/collections/utils.ts` | 28% | 33% | - [ ] Todo |
| 61 | `src/components/message-reactions.tsx` | 40% | 23% | - [ ] Todo |
| 62 | `src/components/notifications-bell.tsx` | 56% | 27% | - [ ] Todo |
| 63 | `src/components/markdown-editor/formatting/handlers.ts` | 55% | 29% | - [ ] Todo |
| 64 | `src/components/markdown-editor/formatting/text-utils.ts` | 62% | 33% | - [ ] Todo |
| 65 | `src/components/markdown-editor/hooks/use-file-upload.ts` | 6% | 0% | - [ ] Todo |
| 66 | `src/components/emoji-reaction-picker.tsx` | 4% | 0% | - [ ] Todo |
| 67 | `src/components/SyncStatusIndicator.tsx` | 13% | 10% | - [ ] Todo |
| 68 | `src/components/course-card.tsx` | 11% | 3% | - [ ] Todo |
| 69 | `server: src/lib/logging.ts` | 20% | 0% | - [ ] Todo |
| 70 | `server: src/lib/sse-sync.ts` | 33% | 29% | - [ ] Todo |
| 71 | `server: src/lib/metrics.ts` | 72% | 0% | - [ ] Todo |

---

## Quick Wins

Tests that would cover the most untested lines with the least effort:

1. **`useSseSync` hook** — 327 untested lines in a single file.
2. **`src/routers/chat/queries.ts`** — 286 untested lines of business logic.
3. **`src/routers/courses/`** — 267 untested lines across queries/mutations.
4. **Forms components** — 303 untested lines across 13 form files.
5. **`src/routers/reviews/`** — 174 untested lines.
6. **`src/routers/directMessages/`** — 171 untested lines.
7. **REST course handlers** — 150 untested lines.
8. **`src/routers/dataExport/`** — 116 untested lines (pure utility functions).

---

## How to Run Coverage

```bash
# Server unit coverage
pnpm --filter @apps/server test:coverage

# Web unit coverage
pnpm --filter @apps/web test:coverage

# Both via turborepo
pnpm test:coverage

# Cypress E2E with coverage instrumentation
pnpm --filter @apps/web e2e:coverage

# Generate Cypress coverage report
pnpm --filter @apps/web e2e:coverage:report
```

Reports are generated in:

- `apps/server/coverage/unit/` — Server Vitest HTML report
- `apps/web/coverage/unit/` — Web Vitest HTML report
- `apps/web/coverage/e2e/` — Web Cypress E2E report

---

## Existing Test Files

### Server (7 test files, 172 tests)

- `src/hooks/tests/authHooks.test.ts` — 6 tests
- `src/lib/tests/config.test.ts` — 49 tests
- `src/lib/tests/constants.test.ts` — 14 tests
- `src/lib/tests/metrics.test.ts` — 34 tests
- `src/lib/tests/normalized-route.test.ts` — 26 tests
- `src/lib/tests/notifications.test.ts` — 25 tests
- `src/lib/tests/sse-sync.test.ts` — 18 tests

### Web (20 test files, 293 tests)

- `src/components/__tests__/format-duration.test.ts` — 7 tests
- `src/components/__tests__/message-reactions-helpers.test.ts` — 10 tests
- `src/components/__tests__/sync-status-helpers.test.ts` — 13 tests
- `src/components/markdown-editor/__tests__/github-message-editor.test.tsx` — 26 tests
- `src/components/notifications-bell.test.tsx` — 11 tests
- `src/lib/__tests__/rehype-media-embed.test.ts` — 25 tests
- `src/lib/collections/__tests__/utils.test.ts` — 7 tests
- `src/lib/collapsed-media.spec.ts` — 15 tests
- `src/lib/course-access.test.ts` — 12 tests (all skipped)
- `src/lib/utils.spec.ts` — 24 tests
- `src/schema/__tests__/auth-schemas.test.ts` — 18 tests
- `src/schema/__tests__/coupon.test.ts` — 12 tests
- `src/schema/__tests__/course.test.ts` — 17 tests
- `src/schema/__tests__/lesson.test.ts` — 14 tests
- `src/schema/__tests__/misc-schemas.test.ts` — 19 tests
- `src/schema/__tests__/module.test.ts` — 11 tests
- `src/schema/__tests__/profile-form.test.ts` — 14 tests
- `src/schema/__tests__/review.test.ts` — 14 tests
- `src/schema/__tests__/sign-up.test.ts` — 8 tests
- `src/schema/__tests__/support-ticket.test.ts` — 16 tests

### Cypress E2E (17 spec files)

- `account.cy.ts`
- `admin-announcements.cy.ts`
- `admin-course-creation-flow.cy.ts`
- `admin-course-editor.cy.ts`
- `admin-courses.cy.ts`
- `admin-navigation.cy.ts`
- `admin-stats.cy.ts`
- `auth-forms.cy.ts`
- `chat-support-tickets.cy.ts`
- `cookie-policy.cy.ts`
- `dashboard.cy.ts`
- `data-export.cy.ts`
- `downloads.cy.ts`
- `navigation-and-guards.cy.ts`
- `profile.cy.ts`
- `reset-password.cy.ts`
- `spec.cy.ts`

---

## Notes

- `src/lib/course-access.test.ts` has 12 tests but all are **skipped** — needs investigation.
- Route files have very few lines themselves (mostly re-exports) — coverage gains there are minimal. E2E tests are more effective for route coverage.
- DB schema files are primarily type/structure definitions — coverage benefit of testing them is low vs. testing queries and mutations that use them.
- Plugin files are mostly thin configuration wrappers — lower priority unless they contain custom logic.
