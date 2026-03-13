/**
 * If a new user visits /chat without a username, the "Username Required for Chat"
 * modal automatically opens. Fill in the username field and submit so the rest of
 * the test can interact with the real chat UI.
 *
 * Uses cy.waitForContent to gate the snapshot so the cy.get("body").then() check
 * only fires once the page has settled (either the DM button is in the DOM or
 * the modal text is present). Without this gate the snapshot can fire before the
 * modal renders and silently miss it, leaving the overlay in place.
 */
function setUsernameIfRequired() {
  cy.waitForContent(
    'button[aria-label="New direct message"]',
    "Username Required for Chat",
    { timeout: 10000 },
  );
  cy.get("body").then(($body) => {
    if ($body.text().includes("Username Required for Chat")) {
      cy.get("#username").type("chatuser");
      cy.contains("button", "Set Username & Join Chat").click();
      // Wait for the modal overlay to disappear and the DM button to be interactive
      cy.get('button[aria-label="New direct message"]', {
        timeout: 15000,
      }).should("be.visible");
    }
    return null;
  });
}

describe("Direct Messages - Unauthenticated", () => {
  it("redirects to sign-in when visiting chat without authentication", () => {
    cy.clearAllCookies();
    cy.clearAllLocalStorage();
    cy.visit("/chat");
    cy.url().should("include", "/signin");
  });
});

describe("Direct Messages - Authenticated", () => {
  beforeEach(() => {
    cy.loginAsRegularUser();
  });

  it("shows the Community Chat heading on the chat page", () => {
    cy.visit("/chat");
    // The h1 is sr-only but should be in the DOM
    cy.get("h1").contains("Community Chat").should("exist");
  });

  it("shows the Direct Messages section in the sidebar", () => {
    cy.visit("/chat");
    cy.contains("Direct Messages").should("be.visible");
  });

  it("shows the New Direct Message button", () => {
    cy.visit("/chat");
    cy.get('button[aria-label="New direct message"]').should("be.visible");
  });

  it("shows empty state when no DMs exist", () => {
    cy.visit("/chat");
    setUsernameIfRequired();
    cy.waitForContent('a[href*="/chat/dm"]', "No direct messages yet");

    cy.get("body").then(($body) => {
      if ($body.text().includes("No direct messages yet")) {
        cy.contains("No direct messages yet").should("be.visible");
      } else {
        // DMs exist — ensure at least one conversation link is shown
        cy.get('a[href*="/chat/dm"]').should("exist");
      }
      return null;
    });
  });

  it("shows a user search dialog when New direct message button is clicked", () => {
    cy.visit("/chat");
    setUsernameIfRequired();

    cy.get('button[aria-label="New direct message"]').click();

    // Clicking the button opens the UserSearchModal whose heading is "Search Users"
    cy.contains("Search Users").should("be.visible");
  });

  it("can navigate to an existing DM conversation", () => {
    cy.visit("/chat");

    cy.get("body").then(($body) => {
      const hasDMLinks = $body.find('a[href*="/chat/dm"]').length > 0;

      if (!hasDMLinks) {
        cy.contains("No direct messages yet").should("be.visible");
        return null;
      }

      cy.get('a[href*="/chat/dm"]').first().click();
      cy.url().should("match", /\/chat\/dm\//);
      return null;
    });
  });

  it("shows channel navigation in the chat sidebar", () => {
    cy.visit("/chat");

    // The channels should be visible in the sidebar
    cy.get("nav, aside, [role='navigation']").should("exist");
  });
});

describe("Direct Messages - Admin", () => {
  beforeEach(() => {
    cy.loginAsAdmin();
  });

  it("admin can also access the chat page", () => {
    cy.visit("/chat");
    cy.get("h1").contains("Community Chat").should("exist");
  });

  it("admin sees the Direct Messages section", () => {
    cy.visit("/chat");
    cy.contains("Direct Messages").should("be.visible");
  });
});
