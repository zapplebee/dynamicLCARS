describe("terminal action buttons", () => {
  it("renders eight rounded shell action buttons and posts the expected input payloads", () => {
    cy.visit("/");

    cy.contains("SHELL 1", { timeout: 30000 }).should("be.visible");

    const expectedLabels = [
      "TAB",
      "ENTER",
      "UP",
      "CTRL+C",
      "STATUS",
      "GIT ADD",
      "COMMIT MSG",
      "AUTO COMMIT",
    ];

    expectedLabels.forEach((label) => {
      cy.contains("button", label).should("be.visible").and("have.class", "lcars-button--rounded");
    });

    cy.intercept("POST", "/api/shells/input").as("shellInput");

    cy.contains("button", "STATUS").click({ force: true });
    cy.wait("@shellInput").its("request.body.data").should("eq", "git status\r");

    cy.contains("button", "TAB").click({ force: true });
    cy.wait("@shellInput").its("request.body.data").should("eq", "\t");

    cy.contains("button", "ENTER").click({ force: true });
    cy.wait("@shellInput").its("request.body.data").should("eq", "\r");
  });
});
