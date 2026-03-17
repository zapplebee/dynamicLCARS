const terminalTextarea = ".xterm-helper-textarea";
const terminalRows = ".xterm-rows";

function typeInTerminal(command) {
  cy.get(terminalTextarea, { timeout: 30000 })
    .focus()
    .type(`${command}{enter}`, {
      delay: 0,
      force: true,
      parseSpecialCharSequences: true,
    });
}

describe("shell sessions", () => {
  it("creates, switches, and reconnects persistent shells", () => {
    cy.visit("/");

    cy.contains("SHELL 1", { timeout: 30000 }).should("be.visible");
    cy.contains("ONLINE", { timeout: 30000 }).should("be.visible");

    typeInTerminal("export LCARS_MARKER=one && printf 'ONE:%s\\n' \"$LCARS_MARKER\"");
    cy.get(terminalRows).should("contain.text", "ONE:one");

    cy.contains("+ SHELL").click();
    cy.contains("SHELL 2", { timeout: 10000 }).should("be.visible");
    cy.contains("SHELL 2").click();
    cy.contains("ONLINE", { timeout: 30000 }).should("be.visible");

    typeInTerminal("printf 'TWO:%s\\n' \"${LCARS_MARKER:-missing}\"");
    cy.get(terminalRows).should("contain.text", "TWO:missing");

    cy.contains("SHELL 1").click();
    cy.contains("ONLINE", { timeout: 30000 }).should("be.visible");

    typeInTerminal("printf 'BACK:%s\\n' \"$LCARS_MARKER\"");
    cy.get(terminalRows).should("contain.text", "BACK:one");

    cy.reload();

    cy.contains("SHELL 1", { timeout: 30000 }).should("be.visible");
    cy.contains("SHELL 2", { timeout: 30000 }).should("be.visible");
    cy.contains("ONLINE", { timeout: 30000 }).should("be.visible");

    typeInTerminal("printf 'RELOAD_OK\\n'");
    cy.get(terminalRows).should("contain.text", "RELOAD_OK");
  });
});
