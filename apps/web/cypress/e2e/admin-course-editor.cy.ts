import { faker } from "@faker-js/faker";

describe("Admin Course Editor", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("should display course editor page", () => {
    cy.visit("/admin/courses");

    // Verify courses page loads
    cy.contains("Courses").should("be.visible");
  });

  it("should open edit page from courses table when a course exists", () => {
    cy.visit("/admin/courses");

    // Gate: wait for the course table to render before taking the one-shot
    // DOM snapshot. Without this the snapshot may fire before the collection
    // populates the table, returning no edit links and silently skipping the
    // real assertions.
    cy.waitForContent("tbody tr", "No courses found");

    cy.get("body").then(($body) => {
      if ($body.text().includes("No courses found")) {
        cy.contains("No courses found").should("be.visible");
        return null;
      }

      const editLink = $body
        .find('a[href*="/admin/courses/"][href$="/edit"]')
        .first();

      if (editLink.length === 0) {
        cy.contains(/No courses found|Create New Course/i).should("be.visible");
        return null;
      }

      cy.wrap(editLink).click();
      cy.url().should("include", "/admin/courses/");
      cy.url().should("include", "/edit");
      cy.contains("Edit course structure, modules, and lessons").should(
        "be.visible",
      );
      cy.contains("No selection").should("be.visible");

      return null;
    });
  });

  it("should show not found state for unknown course id", () => {
    const missingCourseId = `missing-${faker.string.alphanumeric(12)}`;

    cy.visit(`/admin/courses/${missingCourseId}/edit`, {
      failOnStatusCode: false,
    });

    cy.contains("Course not found").should("be.visible");
    cy.contains("Back to Courses").should("be.visible");
  });
});

/** Fixture course with transcript-enabled lessons seeded by the CI pipeline. */
const TEST_COURSE_ID = "course%3A01TESTCOURSE00000000001";

describe("Admin Course Editor — Transcript Section", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("shows the transcript editor section when a lesson with transcript is selected", () => {
    cy.visit(`/admin/courses/${TEST_COURSE_ID}/edit`);

    cy.contains("Edit course structure, modules, and lessons", {
      timeout: 15000,
    }).should("be.visible");

    // Modules are expanded by default — click the first lesson title directly.
    // The first lesson "What is Fastify?" has a valid Phase 1 transcript.
    cy.contains("What is Fastify?").click();

    // The TranscriptEditorSection should render with the heading
    cy.contains("h3", "Transcript", { timeout: 10000 }).should("be.visible");

    // Status badge should show cue count for the lesson that has a transcript
    cy.contains("5 cues").should("be.visible");
  });

  it("shows No transcript badge for a lesson without valid transcript", () => {
    cy.visit(`/admin/courses/${TEST_COURSE_ID}/edit`);

    cy.contains("Edit course structure, modules, and lessons", {
      timeout: 15000,
    }).should("be.visible");

    // Click the second lesson — has { segments: [] } (old format, no valid transcript)
    cy.contains("Setting Up Your First Project").click();

    cy.contains("h3", "Transcript", { timeout: 10000 }).should("be.visible");

    // Should show "No transcript" badge
    cy.contains("No transcript").should("be.visible");
  });

  it("shows the VTT upload input in the transcript editor", () => {
    cy.visit(`/admin/courses/${TEST_COURSE_ID}/edit`);

    cy.contains("Edit course structure, modules, and lessons", {
      timeout: 15000,
    }).should("be.visible");

    // Select a lesson without transcript to see the upload UI
    cy.contains("Setting Up Your First Project").click();

    cy.contains("h3", "Transcript", { timeout: 10000 }).should("be.visible");

    // Upload input should be visible
    cy.get("#vtt-upload").should("exist");
    cy.contains("Upload VTT file").should("be.visible");

    // Help text about WebVTT format should be visible
    cy.contains("Accepts WebVTT (.vtt) files").should("be.visible");
  });
});

describe("Admin Course Editor Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from admin course editor routes", () => {
    cy.visit("/admin/courses");

    cy.assertAccessDenied();
  });
});

describe("Admin Course Editor — Publish Section", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("shows Published status and Unpublish button for a published course", () => {
    cy.visit(`/admin/courses/${TEST_COURSE_ID}/edit`);

    // Wait for collection data to populate the page
    cy.waitForContent(
      'button:contains("Unpublish"), button:contains("Publish Course")',
      "Course not found",
    );

    cy.contains("Published").should("be.visible");
    cy.contains("Visible to enrolled learners").should("be.visible");
    cy.contains("button", "Unpublish").should("be.visible");
  });

  it("shows Draft status and Publish button after unpublishing", () => {
    cy.visit(`/admin/courses/${TEST_COURSE_ID}/edit`);

    cy.waitForContent(
      'button:contains("Unpublish"), button:contains("Publish Course")',
      "Course not found",
    );

    cy.get("body").then(($body) => {
      if ($body.find("button:contains('Unpublish')").length > 0) {
        cy.contains("button", "Unpublish").click();
        cy.contains(/is now a draft/i, { timeout: 10000 }).should("be.visible");
      }
      return null;
    });

    cy.contains("Draft").should("be.visible");
    cy.contains("Not visible to learners").should("be.visible");
    cy.contains("button", "Publish Course").should("be.visible");
  });

  it("shows blocking lessons list when publish is attempted with invalid transcripts", () => {
    cy.visit(`/admin/courses/${TEST_COURSE_ID}/edit`);

    cy.waitForContent(
      'button:contains("Unpublish"), button:contains("Publish Course")',
      "Course not found",
    );

    cy.get("body").then(($body) => {
      if ($body.find("button:contains('Unpublish')").length > 0) {
        cy.contains("button", "Unpublish").click();
        cy.contains(/is now a draft/i, { timeout: 10000 }).should("be.visible");
      }
      return null;
    });

    cy.contains("button", "Publish Course").click();

    // Blocking list should appear with the "Cannot publish" heading
    cy.contains(/Cannot publish/i, { timeout: 10000 }).should("be.visible");

    // A lesson with an invalid transcript should be listed
    cy.contains("button", "Setting Up Your First Project").should("be.visible");

    // At least one reason label should be visible
    cy.contains(/Transcript data is malformed/i).should("be.visible");
  });

  it("clicking a blocking lesson button opens it in the transcript editor", () => {
    cy.visit(`/admin/courses/${TEST_COURSE_ID}/edit`);

    cy.waitForContent(
      'button:contains("Unpublish"), button:contains("Publish Course")',
      "Course not found",
    );

    cy.get("body").then(($body) => {
      if ($body.find("button:contains('Unpublish')").length > 0) {
        cy.contains("button", "Unpublish").click();
        cy.contains(/is now a draft/i, { timeout: 10000 }).should("be.visible");
      }
      return null;
    });

    cy.contains("button", "Publish Course").click();
    cy.contains(/Cannot publish/i, { timeout: 10000 }).should("be.visible");

    // Click the blocking lesson button — it should invoke onSelectLesson
    cy.contains("button", "Setting Up Your First Project").click();

    // Transcript editor section should open for the selected lesson
    cy.contains("h3", "Transcript", { timeout: 10000 }).should("be.visible");
  });
});
