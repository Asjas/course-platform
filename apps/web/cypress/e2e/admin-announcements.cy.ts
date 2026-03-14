import { faker } from "@faker-js/faker";

describe("Admin Announcements Management", () => {
  let announcementTitle: string;
  let announcementMessage: string;
  let updatedAnnouncementTitle: string;
  let updatedAnnouncementMessage: string;

  beforeEach(() => {
    cy.loginAsAdmin();
    announcementTitle = faker.company.buzzPhrase();
    announcementMessage = faker.lorem.sentences(2);
    updatedAnnouncementTitle = faker.company.catchPhrase();
    updatedAnnouncementMessage = faker.lorem.sentences(3);
  });

  it("should display announcements page", () => {
    cy.visit("/admin/announcements");

    // Verify page loads
    cy.contains("Announcements").should("be.visible");
  });

  it("should have create announcement button", () => {
    cy.visit("/admin/announcements");

    cy.contains("Create Announcement").should("be.visible");
  });

  it.skip("should support full CRUD lifecycle for announcement", () => {
    cy.visit("/admin/announcements");

    cy.contains("button", "Create Announcement").click();

    cy.get("#title").as("titleInput");
    cy.get("#message").as("messageInput");

    cy.get("@titleInput").type(announcementTitle);
    cy.get("@messageInput").type(announcementMessage);
    cy.get("#type").select("platform_update");
    cy.contains("button", "Publish Now").click();
    cy.get('form[aria-label="Create announcement form"]').within(() => {
      cy.contains("button", "Create").scrollIntoView();
      cy.contains("button", "Create").click({ force: true });
    });

    cy.contains(/Announcement created successfully/i, {
      timeout: 15000,
    }).should("be.visible");
    cy.contains("Select an announcement to edit or create a new one", {
      timeout: 10000,
    }).should("be.visible");

    cy.contains("button", announcementTitle, { timeout: 15000 })
      .should("exist")
      .scrollIntoView();

    cy.contains("button", announcementTitle).click();
    cy.get("#title").as("editTitleInput");
    cy.get("#message").as("editMessageInput");
    cy.get("@editTitleInput").clear();
    cy.get("@editTitleInput").type(updatedAnnouncementTitle);
    cy.get("@editMessageInput").clear();
    cy.get("@editMessageInput").type(updatedAnnouncementMessage);
    cy.get("#type").select("platform_warning");
    cy.contains("button", "Update").scrollIntoView();
    cy.contains("button", "Update").click();

    cy.contains(/Announcement updated successfully/i, {
      timeout: 15000,
    }).should("be.visible");

    cy.contains("button", updatedAnnouncementTitle, { timeout: 15000 })
      .should("exist")
      .scrollIntoView();

    cy.contains("button", updatedAnnouncementTitle).click();
    cy.contains("button", "Delete").click();
    cy.contains("button", "Delete").last().click();

    cy.contains(/Announcement deleted successfully/i, {
      timeout: 10000,
    }).should("be.visible");
    cy.contains("button", updatedAnnouncementTitle).should("not.exist");
  });

  it("should enforce required fields on create", () => {
    cy.visit("/admin/announcements");
    cy.contains("button", "Create Announcement").click();

    cy.get("#title").should("have.attr", "required");
    cy.get("#message").should("have.attr", "required");

    cy.contains("button", "Create").click();

    cy.get("#title:invalid").should("exist");
    cy.get("#message:invalid").should("exist");
  });

  it("should clear publish date and cancel form editing", () => {
    cy.visit("/admin/announcements");
    cy.contains("button", "Create Announcement").click();

    cy.get("#title").type(announcementTitle);
    cy.get("#message").type(announcementMessage);
    cy.contains("button", "Publish Now").click();
    cy.contains("button", "Clear").click();
    cy.get("#publishedAt").should("have.value", "");

    cy.contains("button", "Cancel").click();
    cy.contains("Select an announcement to edit or create a new one").should(
      "be.visible",
    );
  });
});

describe("User-Facing Announcement Notifications", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should display notification bell in header", () => {
    cy.visit("/dashboard");

    // Verify bell icon exists in header - PopoverButton with Bell icon and sr-only text "Notifications"
    cy.get("button").contains("Notifications").should("exist");
  });
});

describe("Admin Announcements Access Control", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("should block non-admin users from admin announcements", () => {
    cy.visit("/admin/announcements");

    cy.assertAccessDenied();
  });
});
