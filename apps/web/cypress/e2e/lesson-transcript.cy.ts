/**
 * Lesson Transcript E2E Tests — Phase 1
 *
 * Verifies that:
 *   - The lesson page shows a Transcription tab in fullscreen mode.
 *   - A lesson with a valid Phase 1 transcript displays cues in timestamp mode.
 *   - Switching to paragraph mode renders paragraph content.
 *   - A lesson with no valid transcript shows an empty-state message.
 *
 * Uses deterministic fixture IDs seeded by the CI pipeline.
 */

/** Fixture IDs for the "What is Fastify?" preview lesson (Phase 1 transcript). */
const TRANSCRIPT_LESSON = {
  courseId: "course:01TESTCOURSE00000000001",
  lessonId: "lesson:01TESTLESSON0000000001",
  url: "/courses/course%3A01TESTCOURSE00000000001/lessons/lesson%3A01TESTLESSON0000000001",
};

/**
 * A lesson that only has the old-format segments payload (no valid Phase 1 transcript).
 * Used to verify the empty-state message.
 */
const NO_TRANSCRIPT_LESSON = {
  courseId: "course:01TESTCOURSE00000000001",
  lessonId: "lesson:01TESTLESSON0000000002",
  url: "/courses/course%3A01TESTCOURSE00000000001/lessons/lesson%3A01TESTLESSON0000000002",
};

describe("Lesson Transcript — Timestamp Mode", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("shows the Transcription tab in fullscreen mode", () => {
    cy.visit(TRANSCRIPT_LESSON.url);

    // Wait for the lesson page to fully load
    cy.contains("Back to Course", { timeout: 15000 }).should("be.visible");

    // Switch to fullscreen layout to reveal the transcript tab
    cy.contains("button", "Fullscreen").click();

    cy.contains("Transcription").should("be.visible");
  });

  it("displays transcript cues in timestamp mode", () => {
    cy.visit(TRANSCRIPT_LESSON.url);
    cy.contains("Back to Course", { timeout: 15000 }).should("be.visible");

    cy.contains("button", "Fullscreen").click();

    // Click the Transcription tab
    cy.contains("Transcription").click();

    // Wait for the transcript panel to render
    cy.get('[data-testid="transcript-panel"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Cue list should be visible by default (timestamp mode)
    cy.get('[data-testid="transcript-cue-list"]').should("be.visible");

    // At least one cue item should be rendered
    cy.get('[data-testid="transcript-cue"]').should(
      "have.length.greaterThan",
      0,
    );
  });

  it("shows cue timestamps and text content", () => {
    cy.visit(TRANSCRIPT_LESSON.url);
    cy.contains("Back to Course", { timeout: 15000 }).should("be.visible");

    cy.contains("button", "Fullscreen").click();
    cy.contains("Transcription").click();

    cy.get('[data-testid="transcript-panel"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // First cue starts at 0ms → timestamp "0:00"
    cy.get('[data-testid="transcript-cue"]')
      .first()
      .within(() => {
        cy.get("[aria-label]").should("contain", "0:00");
      });

    // Fixture transcript text from scripts/fixtures/lessons.ts
    cy.contains("Welcome to the Fastify course.", { timeout: 5000 }).should(
      "be.visible",
    );
  });

  it("shows the Manual source badge", () => {
    cy.visit(TRANSCRIPT_LESSON.url);
    cy.contains("Back to Course", { timeout: 15000 }).should("be.visible");

    cy.contains("button", "Fullscreen").click();
    cy.contains("Transcription").click();

    cy.get('[data-testid="transcript-panel"]', { timeout: 10000 }).should(
      "be.visible",
    );

    cy.contains("Manual").should("be.visible");
  });
});

describe("Lesson Transcript — Paragraph Mode", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("switches to paragraph mode and shows paragraph content", () => {
    cy.visit(TRANSCRIPT_LESSON.url);
    cy.contains("Back to Course", { timeout: 15000 }).should("be.visible");

    cy.contains("button", "Fullscreen").click();
    cy.contains("Transcription").click();

    cy.get('[data-testid="transcript-panel"]', { timeout: 10000 }).should(
      "be.visible",
    );

    // Switch to paragraph mode
    cy.get('[data-testid="transcript-mode-paragraph"]').click();

    // Paragraph list should appear and cue list should disappear
    cy.get('[data-testid="transcript-paragraph-list"]').should("be.visible");
    cy.get('[data-testid="transcript-cue-list"]').should("not.exist");

    // Transcript text should still be visible
    cy.contains("Welcome to the Fastify course.").should("be.visible");
  });

  it("can switch back to timestamp mode from paragraph mode", () => {
    cy.visit(TRANSCRIPT_LESSON.url);
    cy.contains("Back to Course", { timeout: 15000 }).should("be.visible");

    cy.contains("button", "Fullscreen").click();
    cy.contains("Transcription").click();

    cy.get('[data-testid="transcript-panel"]', { timeout: 10000 }).should(
      "be.visible",
    );

    cy.get('[data-testid="transcript-mode-paragraph"]').click();
    cy.get('[data-testid="transcript-paragraph-list"]').should("be.visible");

    cy.get('[data-testid="transcript-mode-timestamp"]').click();
    cy.get('[data-testid="transcript-cue-list"]').should("be.visible");
    cy.get('[data-testid="transcript-paragraph-list"]').should("not.exist");
  });
});

describe("Lesson Transcript — Empty State", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("shows no-transcript message for a lesson without a Phase 1 transcript", () => {
    cy.visit(NO_TRANSCRIPT_LESSON.url);
    cy.contains("Back to Course", { timeout: 15000 }).should("be.visible");

    cy.contains("button", "Fullscreen").click();
    cy.contains("Transcription").click();

    // Should show empty state, not a transcript panel
    cy.get('[data-testid="transcript-empty"]', { timeout: 10000 }).should(
      "be.visible",
    );

    cy.get('[data-testid="transcript-panel"]').should("not.exist");
  });
});

describe("Lesson Transcript — Access Control", () => {
  it("requires authentication to view the lesson transcript", () => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();

    cy.visit(TRANSCRIPT_LESSON.url);

    // Unauthenticated users should be redirected to sign-in
    cy.url().should("include", "/signin");
  });
});
