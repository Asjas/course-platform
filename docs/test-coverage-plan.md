# Test Coverage Plan

> Baseline coverage analysis and phased plan for improving test coverage across
> the course platform. Last updated 2026-03-07.
>
> **Latest run (2026-03-07):** Server 28.38% stmts / 28.42% lines (38 files, 436
> tests) | Web 19.71% stmts / 18.75% lines (41 files, 450 tests)

## Coverage Baseline

### Overall Summary

| App        | Statements        | Branches          | Functions        | Lines             | Test Files |
| ---------- | ----------------- | ----------------- | ---------------- | ----------------- | ---------- |
| **Server** | 28.38% (886/3121) | 23.10% (269/1164) | 28.18% (206/731) | 28.42% (864/3040) | 38         |
| **Web**    | 19.71% (976/4951) | 16.03% (556/3467) | 9.71% (128/1318) | 18.75% (801/4270) | 41         |

### Server (`apps/server`) — 28.42% Line Coverage

**137 total files: 122 untested, 10 partial, 5 fully covered**

#### Server Coverage by Area

| Area                      | Files Tested | Line Coverage | Lines   |
| ------------------------- | ------------ | ------------- | ------- |
| tRPC Routers (17 modules) | 7/42         | partial       | —       |
| REST Routes (3 modules)   | 1/16         | partial       | —       |
| DB Queries                | 2/9          | partial       | —       |
| DB Mutations              | 1/9          | partial       | —       |
| DB Schema                 | 0/17         | 0%            | 0/207   |
| Plugins                   | 0/17         | 0%            | 0/98    |
| Lib                       | 6/16         | 35.9%         | 110/306 |
| Server bootstrap          | 0/4          | 0%            | 0/75    |

#### Server — Fully Covered Files

- `src/config.ts` — 100%
- `src/hooks/authHooks.ts` — 100%
- `src/lib/constants.ts` — 100%
- `src/lib/normalized-route.ts` — 100%
- `src/lib/notifications.ts` — 100%

#### Server — Partially Covered Files

| File                                   | Lines | Branches |
| -------------------------------------- | ----- | -------- |
| `src/lib/logging.ts`                   | 20%   | 0%       |
| `src/lib/sse-sync.ts`                  | 33%   | 29%      |
| `src/lib/metrics.ts`                   | 72%   | 0%       |
| `src/routers/chatReports/queries.ts`   | new   | new      |
| `src/routers/chatReports/mutations.ts` | new   | new      |
| `src/routers/syncStatus/queries.ts`    | new   | new      |
| `src/routers/syncStatus/mutations.ts`  | new   | new      |
| `src/db/queries/courseWishlist.ts`     | new   | new      |
| `src/db/queries/user.ts`               | new   | new      |
| `src/db/mutations/courseWishlist.ts`   | new   | new      |

#### Server — Untested Files (0% Coverage)

<details>
<summary>107 files with zero coverage (click to expand)</summary>

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

**Database — Queries (7 files):**

- `src/db/queries/gdprAudit.ts`
- `src/db/queries/index.ts`
- `src/db/queries/invoice.ts`
- `src/db/queries/payment.ts`
- `src/db/queries/platformAnnouncements.ts`
- `src/db/queries/stats.ts`
- `src/db/queries/teamLicense.ts`

**Database — Mutations (8 files):**

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

**tRPC Routers (20 files):**

- `src/routers/index.ts`
- `src/routers/announcements/index.ts`
- `src/routers/audit/index.ts`
- `src/routers/chat/dmValidation.ts`
- `src/routers/chat/index.ts`
- `src/routers/chatReports/index.ts`
- `src/routers/coupons/index.ts`
- `src/routers/courseWishlist/index.ts`
- `src/routers/courses/index.ts`
- `src/routers/dataExport/index.ts`
- `src/routers/dataExport/queries.ts`
- `src/routers/directMessages/index.ts`
- `src/routers/images/index.ts`
- `src/routers/mentions/index.ts`
- `src/routers/notifications/index.ts`
- `src/routers/purchases/index.ts`
- `src/routers/reviews/index.ts`
- `src/routers/stats/index.ts`
- `src/routers/support-tickets/index.ts`
- `src/routers/supportStatus/index.ts`
- `src/routers/supportStatus/queries.ts`
- `src/routers/syncStatus/index.ts`
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

### Web (`apps/web`) — 18.75% Line Coverage

**214 total files: 155 untested, 40 partial, 19 fully covered**

#### Web Coverage by Area

| Area            | Files Tested | Line Coverage | Lines   |
| --------------- | ------------ | ------------- | ------- |
| Components      | 23/47        | partial       | —       |
| Forms           | 0/13         | 0%            | 0/303   |
| Hooks           | 1/1          | partial       | —       |
| Lib/Collections | 1/36         | 1.8%          | 5/276   |
| Lib             | 7/14         | partial       | —       |
| Components/UI   | 1/15         | 0.9%          | 1/116   |
| Markdown Editor | 9/14         | 54.9%         | 237/432 |
| Routes (all)    | 0/52         | 0%            | 0/166   |
| Schema          | 17/17        | 100%          | 27/27   |

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

| File                                                               | Lines | Branches |
| ------------------------------------------------------------------ | ----- | -------- |
| `src/components/markdown-editor/components/file-upload-footer.tsx` | 95%   | 75%      |
| `src/components/markdown-editor/components/editor-toolbar.tsx`     | 94%   | 50%      |
| `src/components/markdown-editor/components/editor-tabs.tsx`        | 94%   | 66%      |
| `src/components/markdown-editor/github-message-editor.tsx`         | 85%   | 66%      |
| `src/lib/collapsed-media.ts`                                       | 75%   | 81%      |
| `src/components/markdown-editor/formatting/text-utils.ts`          | 62%   | 33%      |
| `src/lib/trpc.client.ts`                                           | 57%   | 100%     |
| `src/components/markdown-editor/hooks/use-markdown-preview.ts`     | 56%   | 100%     |
| `src/components/notifications-bell.tsx`                            | 56%   | 27%      |
| `src/components/markdown-editor/formatting/handlers.ts`            | 55%   | 29%      |
| `src/components/message-reactions.tsx`                             | 40%   | 23%      |
| `src/components/markdown-editor/hooks/use-mention-picker.ts`       | 40%   | 62%      |
| `src/lib/collections/utils.ts`                                     | 28%   | 33%      |
| `src/lib/attachments.ts`                                           | 27%   | 16%      |
| `src/lib/rehype-media-embed.ts`                                    | 23%   | 11%      |
| `src/components/SyncStatusIndicator.tsx`                           | 13%   | 10%      |
| `src/components/ui/button.tsx`                                     | 13%   | 0%       |
| `src/components/markdown-editor/hooks/use-file-upload.ts`          | 6%    | 0%       |
| `src/components/emoji-reaction-picker.tsx`                         | 4%    | 0%       |
| `src/components/chat-date-divider.tsx`                             | new   | new      |
| `src/components/code-block-copy.tsx`                               | new   | new      |
| `src/components/confirm-dialog.tsx`                                | new   | new      |
| `src/components/course-card.tsx`                                   | new   | new      |
| `src/components/empty-state.tsx`                                   | new   | new      |
| `src/components/error-boundary.tsx`                                | new   | new      |
| `src/components/field-info.tsx`                                    | new   | new      |
| `src/components/footer.tsx`                                        | new   | new      |
| `src/components/loading.tsx`                                       | new   | new      |
| `src/components/not-found.tsx`                                     | new   | new      |
| `src/components/auth-links.tsx`                                    | new   | new      |
| `src/components/instructor-card.tsx`                               | new   | new      |
| `src/components/theme-toggle.tsx`                                  | new   | new      |
| `src/components/video-player.tsx`                                  | new   | new      |
| `src/components/blocker.tsx`                                       | new   | new      |
| `src/components/cta-section.tsx`                                   | new   | new      |
| `src/components/file-attachment.tsx`                               | new   | new      |
| `src/components/mention-picker.tsx`                                | new   | new      |
| `src/components/pricing-section.tsx`                               | new   | new      |
| `src/lib/markdown.ts`                                              | new   | new      |

#### Web — Untested Files (0% Coverage)

<details>
<summary>160 files with zero coverage (click to expand)</summary>

**App Bootstrap:**

- `src/main.tsx`
- `src/reportWebVitals.ts`

**Components (26 files):**

- `src/components/chat-message-editor.tsx`
- `src/components/chat-message.tsx`
- `src/components/course-editor-sidebar.tsx`
- `src/components/create-coupon-sheet.tsx`
- `src/components/create-course-sheet.tsx`
- `src/components/create-review-sheet.tsx`
- `src/components/dm-request-modal.tsx`
- `src/components/dm-request-sheet.tsx`
- `src/components/edit-coupon-sheet.tsx`
- `src/components/edit-course-sheet.tsx`
- `src/components/edit-message-sheet.tsx`
- `src/components/edit-user-sheet.tsx`
- `src/components/giphy-picker.tsx`
- `src/components/header.tsx`
- `src/components/markdown-content.tsx`
- `src/components/refund-purchase-modal.tsx`
- `src/components/report-message-dialog.tsx`
- `src/components/review-details-sheet.tsx`
- `src/components/support-comment.tsx`
- `src/components/thread-panel.tsx`
- `src/components/user-profile-sheet.tsx`
- `src/components/user-search-modal.tsx`
- `src/components/username-requirement-modal.tsx`
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

_(All hooks now have tests)_

**Lib (7 untested files):**

- `src/lib/auth.client.ts`
- `src/lib/auth.context.ts`
- `src/lib/auth.provider.tsx`
- `src/lib/db.collections.ts`
- `src/lib/form.context.tsx`
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

### Cypress E2E Tests — 20 Spec Files

#### Features Covered by E2E

- `spec.cy.ts` — Home page, Terms, Privacy, Sign Up, Sign In
- `navigation-and-guards.cy.ts` — Auth guards, public page access, cross-page
  navigation
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
- `blog.cy.ts` — Blog index page, post links, page structure _(new)_
- `theme-toggle.cy.ts` — Theme toggle visibility, light/dark switching,
  persistence _(new)_
- `notifications.cy.ts` — Notification bell visibility, panel interaction
  _(new)_

#### Features NOT Covered by E2E

- Course enrollment and lesson viewing
- Purchases and payments flow
- Course reviews
- Coupon management (admin)
- Direct messages
- User search and mentions
- Sync status page

---

## Test Plan — Phased Implementation

### Phase 1: Server Business Logic (Highest ROI)

These are the largest untested areas containing core business logic.

| #   | Test to Create                                            | Target                 | Lines | Status     |
| --- | --------------------------------------------------------- | ---------------------- | ----- | ---------- |
| 1   | `src/routers/courses/__tests__/queries.test.ts`           | Course queries         | 267   | - [x] Done |
| 2   | `src/routers/courses/__tests__/mutations.test.ts`         | Course mutations       | —     | - [x] Done |
| 3   | `src/routers/reviews/__tests__/queries.test.ts`           | Review queries         | 174   | - [x] Done |
| 4   | `src/routers/reviews/__tests__/mutations.test.ts`         | Review mutations       | —     | - [x] Done |
| 5   | `src/routers/chat/__tests__/queries.test.ts`              | Chat queries           | 286   | - [x] Done |
| 6   | `src/routers/support-tickets/__tests__/queries.test.ts`   | Ticket queries         | 115   | - [x] Done |
| 7   | `src/routers/support-tickets/__tests__/mutations.test.ts` | Ticket mutations       | —     | - [x] Done |
| 8   | `src/routers/purchases/__tests__/queries.test.ts`         | Purchase queries       | 80    | - [x] Done |
| 9   | `src/routers/purchases/__tests__/mutations.test.ts`       | Purchase mutations     | —     | - [x] Done |
| 10  | `src/routers/coupons/__tests__/queries.test.ts`           | Coupon queries         | 109   | - [x] Done |
| 11  | `src/routers/coupons/__tests__/mutations.test.ts`         | Coupon mutations       | —     | - [x] Done |
| 12  | `src/routers/dataExport/__tests__/csvUtils.test.ts`       | CSV utility functions  | 116   | - [x] Done |
| 13  | `src/routers/dataExport/__tests__/rateLimit.test.ts`      | Rate limit logic       | —     | - [x] Done |
| 14  | `src/routers/directMessages/__tests__/queries.test.ts`    | DM queries             | 171   | - [x] Done |
| 15  | `src/routers/directMessages/__tests__/mutations.test.ts`  | DM mutations           | —     | - [x] Done |
| 16  | `src/routers/notifications/__tests__/queries.test.ts`     | Notification queries   | 69    | - [x] Done |
| 17  | `src/routers/notifications/__tests__/mutations.test.ts`   | Notification mutations | —     | - [x] Done |

### Phase 2: Server DB and Infrastructure

| #   | Test to Create                                      | Target                  | Lines | Status     |
| --- | --------------------------------------------------- | ----------------------- | ----- | ---------- |
| 18  | `src/db/queries/__tests__/*.test.ts`                | All DB query files      | 143   | - [x] Done |
| 19  | `src/db/mutations/__tests__/*.test.ts`              | All DB mutation files   | 117   | - [x] Done |
| 20  | `src/routers/chat/__tests__/dmValidation.test.ts`   | DM validation logic     | —     | - [x] Done |
| 21  | `src/lib/tests/logging.test.ts`                     | Logging (currently 20%) | 306   | - [x] Done |
| 22  | `src/lib/tests/cache.test.ts`                       | Cache module            | —     | - [ ] Todo |
| 23  | `src/lib/tests/mailer.test.ts`                      | Email sending           | —     | - [ ] Todo |
| 24  | `src/routes/courses/__tests__/handlers.test.ts`     | REST course handlers    | 150   | - [x] Done |
| 25  | `src/routers/chatReports/__tests__/*.test.ts`       | Chat reports            | 68    | - [x] Done |
| 26  | `src/routers/announcements/__tests__/index.test.ts` | Announcements router    | 66    | - [x] Done |
| 27  | `src/routers/stats/__tests__/index.test.ts`         | Stats router            | 61    | - [x] Done |
| 28  | `src/routers/mentions/__tests__/index.test.ts`      | Mentions router         | 46    | - [x] Done |
| 28a | `src/routers/supportStatus/__tests__/index.test.ts` | Support status router   | —     | - [x] Done |
| 28b | `src/routers/syncStatus/__tests__/*.test.ts`        | Sync status             | —     | - [x] Done |

### Phase 3: Web Components (Highest Untested Line Count)

| #   | Test to Create                                      | Target            | Lines | Status     |
| --- | --------------------------------------------------- | ----------------- | ----- | ---------- |
| 29  | `src/hooks/__tests__/useSseSync.test.ts`            | SSE sync hook     | 327   | - [x] Done |
| 30  | `src/components/__tests__/header.test.tsx`          | Header component  | —     | - [ ] Todo |
| 31  | `src/components/__tests__/footer.test.tsx`          | Footer component  | —     | - [x] Done |
| 32  | `src/components/__tests__/error-boundary.test.tsx`  | Error boundary    | —     | - [x] Done |
| 33  | `src/components/__tests__/confirm-dialog.test.tsx`  | Confirm dialog    | —     | - [x] Done |
| 34  | `src/components/__tests__/video-player.test.tsx`    | Video player      | —     | - [x] Done |
| 35  | `src/components/__tests__/course-card.test.tsx`     | Course card (11%) | —     | - [x] Done |
| 36  | `src/components/__tests__/theme-toggle.test.tsx`    | Theme toggle      | —     | - [x] Done |
| 37  | `src/components/__tests__/loading.test.tsx`         | Loading component | —     | - [x] Done |
| 38  | `src/components/__tests__/empty-state.test.tsx`     | Empty state       | —     | - [x] Done |
| 39  | `src/components/__tests__/chat-message.test.tsx`    | Chat message      | —     | - [ ] Todo |
| 40  | `src/components/__tests__/code-block-copy.test.tsx` | Code block copy   | —     | - [x] Done |
| 40b | `src/components/__tests__/blocker.test.tsx`         | Blocker component | —     | - [x] Done |
| 40c | `src/components/__tests__/cta-section.test.tsx`     | CTA section       | —     | - [x] Done |
| 40d | `src/components/__tests__/file-attachment.test.tsx` | File attachment   | —     | - [x] Done |
| 40e | `src/components/__tests__/mention-picker.test.tsx`  | Mention picker    | —     | - [x] Done |
| 40f | `src/components/__tests__/pricing-section.test.tsx` | Pricing section   | —     | - [x] Done |

### Phase 4: Web Forms and UI Components

| #   | Test to Create                                                       | Target               | Lines     | Status     |
| --- | -------------------------------------------------------------------- | -------------------- | --------- | ---------- |
| 41  | `src/components/forms/__tests__/sign-in-form.test.tsx`               | Sign in form         | 303 total | - [ ] Todo |
| 42  | `src/components/forms/__tests__/sign-up-form.test.tsx`               | Sign up form         | —         | - [ ] Todo |
| 43  | `src/components/forms/__tests__/profile-form.test.tsx`               | Profile form         | —         | - [ ] Todo |
| 44  | `src/components/forms/__tests__/create-course-form.test.tsx`         | Course creation form | —         | - [ ] Todo |
| 45  | `src/components/forms/__tests__/create-support-ticket-form.test.tsx` | Support ticket form  | —         | - [ ] Todo |
| 46  | `src/components/forms/__tests__/change-password-form.test.tsx`       | Change password form | —         | - [ ] Todo |
| 47  | `src/components/forms/__tests__/change-email-form.test.tsx`          | Change email form    | —         | - [ ] Todo |
| 48  | `src/lib/__tests__/auth.client.test.ts`                              | Auth client          | —         | - [ ] Todo |
| 49  | `src/lib/__tests__/markdown.test.ts`                                 | Markdown utils       | —         | - [x] Done |

### Phase 5: Missing E2E Tests

| #   | Test to Create                        | Target                               | Status     |
| --- | ------------------------------------- | ------------------------------------ | ---------- |
| 50  | `cypress/e2e/course-enrollment.cy.ts` | Course enrollment and lesson viewing | - [ ] Todo |
| 51  | `cypress/e2e/purchases.cy.ts`         | Purchases flow                       | - [ ] Todo |
| 52  | `cypress/e2e/reviews.cy.ts`           | Course reviews                       | - [ ] Todo |
| 53  | `cypress/e2e/notifications.cy.ts`     | Notifications                        | - [x] Done |
| 54  | `cypress/e2e/coupons.cy.ts`           | Coupon management                    | - [ ] Todo |
| 55  | `cypress/e2e/blog.cy.ts`              | Blog pages                           | - [x] Done |
| 56  | `cypress/e2e/direct-messages.cy.ts`   | Direct messages                      | - [ ] Todo |
| 57  | `cypress/e2e/theme-toggle.cy.ts`      | Theme toggling                       | - [x] Done |

### Phase 6: Improve Partial Coverage

| #   | File                                                      | Current Lines | Current Branches | Status     |
| --- | --------------------------------------------------------- | ------------- | ---------------- | ---------- |
| 58  | `src/lib/rehype-media-embed.ts`                           | 23%           | 11%              | - [ ] Todo |
| 59  | `src/lib/attachments.ts`                                  | 27%           | 16%              | - [ ] Todo |
| 60  | `src/lib/collections/utils.ts`                            | 28%           | 33%              | - [ ] Todo |
| 61  | `src/components/message-reactions.tsx`                    | 40%           | 23%              | - [ ] Todo |
| 62  | `src/components/notifications-bell.tsx`                   | 56%           | 27%              | - [ ] Todo |
| 63  | `src/components/markdown-editor/formatting/handlers.ts`   | 55%           | 29%              | - [ ] Todo |
| 64  | `src/components/markdown-editor/formatting/text-utils.ts` | 62%           | 33%              | - [ ] Todo |
| 65  | `src/components/markdown-editor/hooks/use-file-upload.ts` | 6%            | 0%               | - [ ] Todo |
| 66  | `src/components/emoji-reaction-picker.tsx`                | 4%            | 0%               | - [ ] Todo |
| 67  | `src/components/SyncStatusIndicator.tsx`                  | 13%           | 10%              | - [ ] Todo |
| 68  | `src/components/course-card.tsx`                          | partial       | partial          | - [x] Done |
| 69  | `server: src/lib/logging.ts`                              | 20%           | 0%               | - [ ] Todo |
| 70  | `server: src/lib/sse-sync.ts`                             | 33%           | 29%              | - [ ] Todo |
| 71  | `server: src/lib/metrics.ts`                              | 72%           | 0%               | - [ ] Todo |

---

## Quick Wins

Tests that would cover the most untested lines with the least effort:

1. ~~**`useSseSync` hook** — 327 untested lines in a single file.~~ **Done** (5
   tests)
2. ~~**`src/routers/chat/queries.ts`** — 286 untested lines of business logic.~~
   **Done** (17 tests)
3. ~~**`src/routers/courses/`** — 267 untested lines across queries/mutations.~~
   **Done** (16 tests)
4. **Forms components** — 303 untested lines across 13 form files.
5. ~~**`src/routers/reviews/`** — 174 untested lines.~~ **Done** (11 tests)
6. ~~**`src/routers/directMessages/`** — 171 untested lines.~~ **Done** (5
   tests)
7. ~~**REST course handlers** — 150 untested lines.~~ **Done** (18 tests)
8. ~~**`src/routers/dataExport/`** — 116 untested lines (pure utility
   functions).~~ **Done** (33 tests)

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

### Server (38 test files, 436 tests)

- `src/hooks/tests/authHooks.test.ts` — 6 tests
- `src/lib/tests/config.test.ts` — 49 tests
- `src/lib/tests/constants.test.ts` — 14 tests
- `src/lib/tests/metrics.test.ts` — 34 tests
- `src/lib/tests/normalized-route.test.ts` — 26 tests
- `src/lib/tests/notifications.test.ts` — 25 tests
- `src/lib/tests/sse-sync.test.ts` — 18 tests
- `src/lib/tests/logging.test.ts` — 6 tests _(new)_
- `src/db/queries/__tests__/courseWishlist.test.ts` — 12 tests _(new)_
- `src/db/queries/__tests__/user.test.ts` — 5 tests _(new)_
- `src/db/mutations/__tests__/courseWishlist.test.ts` — 5 tests _(new)_
- `src/routers/chat/__tests__/queries.test.ts` — 17 tests
- `src/routers/chat/__tests__/dmValidation.test.ts` — 7 tests _(new)_
- `src/routers/chatReports/__tests__/queries.test.ts` — 7 tests _(new)_
- `src/routers/chatReports/__tests__/mutations.test.ts` — 9 tests _(new)_
- `src/routers/coupons/__tests__/queries.test.ts` — 6 tests
- `src/routers/coupons/__tests__/mutations.test.ts` — 5 tests
- `src/routers/courses/__tests__/queries.test.ts` — 3 tests
- `src/routers/courses/__tests__/mutations.test.ts` — 13 tests
- `src/routers/dataExport/__tests__/csvUtils.test.ts` — 25 tests
- `src/routers/dataExport/__tests__/rateLimit.test.ts` — 8 tests
- `src/routers/directMessages/__tests__/queries.test.ts` — 3 tests
- `src/routers/directMessages/__tests__/mutations.test.ts` — 2 tests
- `src/routers/notifications/__tests__/queries.test.ts` — 6 tests
- `src/routers/notifications/__tests__/mutations.test.ts` — 5 tests
- `src/routers/purchases/__tests__/queries.test.ts` — 9 tests
- `src/routers/purchases/__tests__/mutations.test.ts` — 4 tests
- `src/routers/reviews/__tests__/queries.test.ts` — 4 tests
- `src/routers/reviews/__tests__/mutations.test.ts` — 7 tests
- `src/routers/support-tickets/__tests__/queries.test.ts` — 9 tests
- `src/routers/support-tickets/__tests__/mutations.test.ts` — 6 tests
- `src/routers/supportStatus/__tests__/index.test.ts` — 5 tests _(new)_
- `src/routers/syncStatus/__tests__/queries.test.ts` — 6 tests _(new)_
- `src/routers/syncStatus/__tests__/mutations.test.ts` — 9 tests _(new)_
- `src/routers/announcements/__tests__/index.test.ts` — 12 tests _(new)_
- `src/routers/mentions/__tests__/index.test.ts` — 8 tests _(new)_
- `src/routers/stats/__tests__/index.test.ts` — 21 tests _(new)_
- `src/routes/courses/__tests__/handlers.test.ts` — 18 tests

### Web (41 test files, 450 tests + 12 todo)

- `src/components/__tests__/auth-links.test.tsx` — 9 tests
- `src/components/__tests__/blocker.test.tsx` — 8 tests _(new)_
- `src/components/__tests__/chat-date-divider.test.tsx` — 6 tests
- `src/components/__tests__/code-block-copy.test.tsx` — 5 tests
- `src/components/__tests__/confirm-dialog.test.tsx` — 7 tests
- `src/components/__tests__/course-card.test.tsx` — 23 tests
- `src/components/__tests__/cta-section.test.tsx` — 5 tests _(new)_
- `src/components/__tests__/empty-state.test.tsx` — 5 tests
- `src/components/__tests__/error-boundary.test.tsx` — 5 tests
- `src/components/__tests__/field-info.test.tsx` — 5 tests
- `src/components/__tests__/file-attachment.test.tsx` — 9 tests _(new)_
- `src/components/__tests__/footer.test.tsx` — 10 tests
- `src/components/__tests__/format-duration.test.ts` — 7 tests
- `src/components/__tests__/instructor-card.test.tsx` — 6 tests
- `src/components/__tests__/loading.test.tsx` — 4 tests
- `src/components/__tests__/mention-picker.test.tsx` — 7 tests _(new)_
- `src/components/__tests__/message-reactions-helpers.test.ts` — 10 tests
- `src/components/__tests__/not-found.test.tsx` — 2 tests
- `src/components/__tests__/pricing-section.test.tsx` — 9 tests _(new)_
- `src/components/__tests__/sync-status-helpers.test.ts` — 13 tests
- `src/components/__tests__/theme-toggle.test.tsx` — 6 tests
- `src/components/__tests__/video-player.test.tsx` — 6 tests
- `src/components/markdown-editor/__tests__/github-message-editor.test.tsx` — 26
  tests
- `src/components/notifications-bell.test.tsx` — 11 tests
- `src/hooks/__tests__/useSseSync.test.ts` — 5 tests
- `src/lib/__tests__/markdown.test.ts` — 15 tests
- `src/lib/__tests__/rehype-media-embed.test.ts` — 25 tests
- `src/lib/collections/__tests__/utils.test.ts` — 7 tests
- `src/lib/collapsed-media.spec.ts` — 15 tests
- `src/lib/course-access.test.ts` — 12 tests (all skipped/todo)
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

### Cypress E2E (20 spec files)

- `account.cy.ts`
- `admin-announcements.cy.ts`
- `admin-course-creation-flow.cy.ts`
- `admin-course-editor.cy.ts`
- `admin-courses.cy.ts`
- `admin-navigation.cy.ts`
- `admin-stats.cy.ts`
- `auth-forms.cy.ts`
- `blog.cy.ts` _(new)_
- `chat-support-tickets.cy.ts`
- `cookie-policy.cy.ts`
- `dashboard.cy.ts`
- `data-export.cy.ts`
- `downloads.cy.ts`
- `navigation-and-guards.cy.ts`
- `notifications.cy.ts` _(new)_
- `profile.cy.ts`
- `reset-password.cy.ts`
- `spec.cy.ts`
- `theme-toggle.cy.ts` _(new)_

---

## Coverage Delta (2026-03-07)

Compared to the previous baseline in this document:

| App        | Statements | Branches | Functions | Lines    | Test Files | Tests |
| ---------- | ---------- | -------- | --------- | -------- | ---------- | ----- |
| **Server** | +8.90 pp   | +6.44 pp | +5.48 pp  | +9.05 pp | +6         | +59   |
| **Web**    | +0.00 pp   | +0.00 pp | +0.00 pp  | +0.00 pp | +0         | +0    |

## Coverage Update Rule

After every test batch:

1. Run `pnpm --filter @apps/server test:coverage` and
   `pnpm --filter @apps/web test:coverage`.
2. Record latest percentages and counts at the top of this document.
3. Add or refresh a delta table versus the previous baseline.
4. Update relevant phase checkboxes and test inventory counts.

## Notes

- `src/lib/course-access.test.ts` has 12 tests but all are **skipped** — needs
  investigation.
- Route files have very few lines themselves (mostly re-exports) — coverage
  gains there are minimal. E2E tests are more effective for route coverage.
- DB schema files are primarily type/structure definitions — coverage benefit of
  testing them is low vs. testing queries and mutations that use them.
- Plugin files are mostly thin configuration wrappers — lower priority unless
  they contain custom logic.
