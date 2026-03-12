# Legal Policy Review — codewizard.training & learnfastify.com

**Review Date**: March 1, 2026

Policies reviewed:

- <https://codewizard.training/terms>
- <https://codewizard.training/privacy>
- <https://codewizard.training/cookies>
- <https://codewizard.training>
- <https://learnfastify.com>

---

## 1. Refund Policy Contradiction (CRITICAL)

- **Terms of Service** (codewizard.training/terms): States a **60-day** refund
  window.
- **learnfastify.com** (Pricing + FAQ): States a **30-day money-back
  guarantee**.

The FAQ on learnfastify.com says: _"If the course doesn't meet your expectations
within 30 days of purchase, contact me for a full refund."_ This directly
conflicts with the Terms, which grant 60 days.

**Action**: Align these — either update the Terms to 30 days or update
learnfastify.com to 60 days.

---

## 2. Scope / Multi-Domain Coverage Gap

None of the three policies explicitly mention **learnfastify.com** or
acknowledge that "Services" span multiple domains.

| Policy      | Current Scope Language                                    | Issue                                                 |
| ----------- | --------------------------------------------------------- | ----------------------------------------------------- |
| **Terms**   | _"The Codewizard Training platform and related features"_ | Doesn't name learnfastify.com                         |
| **Privacy** | _"all personal data collected from users worldwide"_      | Doesn't list which websites/domains are covered       |
| **Cookies** | No scope statement                                        | Only references codewizard.training URLs for settings |

**Action**: Add a clause stating the policies cover codewizard.training,
learnfastify.com, and any related subdomains or marketing sites operated by
Codewizard Training.

---

## 3. Undocumented Data Collection on learnfastify.com

The waitlist signup form on learnfastify.com collects:

- **Email address** (required)
- **Name** (optional)
- **UTM parameters** (`utm_source`, `utm_medium`, `utm_campaign`)
- **Document referrer**
- **Course slug** (hardcoded)

None of this is mentioned in the Privacy Policy. The "Information We Collect"
section only covers Account Details, Platform Usage Data, and Technical
Information — no mention of waitlist/marketing signups or UTM tracking data.

**Action**: Add a "Marketing & Waitlist Data" subsection to the Privacy Policy
covering what's collected, why, and how long it's retained.

---

## 4. Missing Sub-Processor: Cloudflare

learnfastify.com uses **Cloudflare Insights** (`static.cloudflareinsights.com`
is in the CSP header). This analytics service is:

- Not listed in the **Sub-Processors table** in the Privacy Policy
- Not listed in the **Third-Party Service Providers** section
- Not mentioned in the **Cookie Policy**

**Action**: Add Cloudflare to the sub-processors table and document any
cookies/tracking it sets in the Cookie Policy.

---

## 5. Cookie Policy Gaps for learnfastify.com

- The Cookie Policy only lists cookies for codewizard.training (`session_id`,
  `csrf_token`, `preferences`, Ackee).
- **No Cloudflare Insights cookies/beacons** are documented.
- The opt-out link points to `codewizard.training/settings/privacy` — not
  applicable for learnfastify.com visitors who don't have an account.
- **No cookie consent banner** exists on learnfastify.com (GDPR requires consent
  for non-essential analytics cookies before they load).

**Action**: Add Cloudflare cookies to the Cookie Policy. Provide a cookie
opt-out mechanism for learnfastify.com that works without an account. Consider
adding a cookie consent banner to learnfastify.com.

---

## 6. Contact Information Inconsistency

| Site                    | General Contact               | Questions          |
| ----------------------- | ----------------------------- | ------------------ |
| codewizard.training     | `contact@codewizard.training` | Same               |
| learnfastify.com footer | `contact@codewizard.training` | —                  |
| learnfastify.com FAQ    | `hello@learnfastify.com`      | _different domain_ |

The `hello@learnfastify.com` address in the FAQ isn't referenced in any legal
policy. If that address receives personal data requests or complaints, it should
be documented.

**Action**: Document `hello@learnfastify.com` in legal policies or standardize
on one contact address.

---

## 7. Copyright Year

- codewizard.training footer: **© 2025** (hard-coded, now outdated)
- learnfastify.com footer: dynamically generates current year (correct)

**Action**: Update codewizard.training footer to 2026 or use dynamic year
generation.

---

## Summary of Recommended Changes

| #   | Area                                       | Priority   | Action                                                              |
| --- | ------------------------------------------ | ---------- | ------------------------------------------------------------------- |
| 1   | Refund period                              | **High**   | Align 30-day vs 60-day across Terms + learnfastify.com              |
| 2   | Policy scope                               | **High**   | Add learnfastify.com (and any future domains) to all three policies |
| 3   | Waitlist data collection                   | **High**   | Document in Privacy Policy                                          |
| 4   | Cloudflare sub-processor                   | **Medium** | Add to Privacy Policy sub-processors table + Cookie Policy          |
| 5   | Cookie consent on learnfastify.com         | **Medium** | Add cookie banner or ensure Cloudflare Insights is essential-only   |
| 6   | Cookie management for non-account visitors | **Medium** | Provide a cookie opt-out mechanism that works without an account    |
| 7   | Contact email consistency                  | **Low**    | Document `hello@learnfastify.com` or standardize on one address     |
| 8   | Copyright year                             | **Low**    | Update to 2026 or make dynamic                                      |
