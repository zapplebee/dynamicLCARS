const terminalTextarea = ".xterm-helper-textarea";
const terminalRows = ".xterm-rows";

function typeInTerminal(command) {
  cy.get(terminalTextarea, { timeout: 30000 })
    .focus()
    .type(command, {
      delay: 0,
      force: true,
      parseSpecialCharSequences: false,
    });

  cy.get(terminalTextarea, { timeout: 30000 })
    .focus()
    .type("{enter}", {
      delay: 0,
      force: true,
      parseSpecialCharSequences: true,
    });
}

describe("shell sessions", () => {
  it("creates, switches, and reconnects persistent shells", () => {
    cy.visit("/");

    cy.contains("SHELL 1", { timeout: 30000 }).should("be.visible");
    cy.get(terminalTextarea, { timeout: 30000 }).should("exist");

    typeInTerminal("export LCARS_MARKER=one && printf 'ONE:%s\\n' \"$LCARS_MARKER\"");
    cy.get(terminalRows).should("contain.text", "ONE:one");

    cy.contains("+ SHELL").click();
    cy.contains("SHELL 2", { timeout: 10000 }).should("be.visible");
    cy.contains("SHELL 2").click();

    typeInTerminal("if [ -n \"$LCARS_MARKER\" ]; then printf 'TWO:%s\\n' \"$LCARS_MARKER\"; else printf 'TWO:missing\\n'; fi");
    cy.get(terminalRows).should("contain.text", "TWO:missing");

    cy.contains("SHELL 1").click();

    typeInTerminal("printf 'BACK:%s\\n' \"$LCARS_MARKER\"");
    cy.get(terminalRows).should("contain.text", "BACK:one");

    cy.reload();

    cy.contains("SHELL 1", { timeout: 30000 }).should("be.visible");
    cy.contains("SHELL 2", { timeout: 30000 }).should("be.visible");

    typeInTerminal("printf 'RELOAD_OK\\n'");
    cy.get(terminalRows).should("contain.text", "RELOAD_OK");
  });
});
