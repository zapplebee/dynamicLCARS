const terminalTextarea = ".xterm-helper-textarea";

function readSessionId() {
  return cy.window().then((win) => {
    const sessionId = win.sessionStorage.getItem("lcars-terminal-session-id");

    expect(sessionId, "browser session id").to.be.a("string").and.not.be.empty;
    return sessionId;
  });
}

function fetchShellState(sessionId) {
  return cy.request(`/api/shells?sessionId=${encodeURIComponent(sessionId)}`).its("body");
}

function execInShell(sessionId, shellId, command) {
  return cy.request("POST", "/api/shells/exec", { sessionId, shellId, command }).its("body.output");
}

function execUntilContains(sessionId, shellId, command, expectedText, attemptsLeft = 8) {
  return execInShell(sessionId, shellId, command).then((output) => {
    if (output.includes(expectedText)) {
      return output;
    }

    if (attemptsLeft <= 1) {
      expect(output).to.include(expectedText);
    }

    return cy.wait(500).then(() => execUntilContains(sessionId, shellId, command, expectedText, attemptsLeft - 1));
  });
}

describe("shell sessions", () => {
  it("creates, switches, and reconnects persistent shells", () => {
    cy.visit("/");

    cy.contains("SHELL 1", { timeout: 30000 }).should("be.visible");
    cy.get(terminalTextarea, { timeout: 30000 }).should("exist");

    readSessionId().then((sessionId) => {
      fetchShellState(sessionId).then(({ currentShellId }) => {
        execUntilContains(sessionId, currentShellId, "export LCARS_MARKER=one && printf 'ONE:%s\\n' \"$LCARS_MARKER\"", "ONE:one");
      });
    });

    cy.contains("+ SHELL").click();
    cy.contains("SHELL 2", { timeout: 10000 }).should("be.visible");
    cy.contains("SHELL 2").click();

    readSessionId().then((sessionId) => {
      fetchShellState(sessionId).then(({ currentShellId }) => {
        execUntilContains(sessionId, currentShellId, "if [ -n \"$LCARS_MARKER\" ]; then printf 'TWO:%s\\n' \"$LCARS_MARKER\"; else printf 'TWO:missing\\n'; fi", "TWO:missing");
      });
    });

    cy.contains("SHELL 1").click();

    readSessionId().then((sessionId) => {
      fetchShellState(sessionId).then(({ currentShellId }) => {
        execUntilContains(sessionId, currentShellId, "printf 'BACK:%s\\n' \"$LCARS_MARKER\"", "BACK:one");
      });
    });

    cy.reload();

    cy.contains("SHELL 1", { timeout: 30000 }).should("be.visible");
    cy.contains("SHELL 2", { timeout: 30000 }).should("be.visible");

    readSessionId().then((sessionId) => {
      fetchShellState(sessionId).then(({ currentShellId, shells }) => {
        expect(shells).to.have.length(2);
        execUntilContains(sessionId, currentShellId, "printf 'RELOAD_OK\\n'", "RELOAD_OK");
      });
    });
  });
});
