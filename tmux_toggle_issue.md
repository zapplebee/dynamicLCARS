# Issue: Right-side session buttons update selected tmux state but do not reliably change the visible WeTTY shell

## Summary

The right-side LCARS session buttons successfully talk to the local Bun tmux bridge and update the selected tmux session on `nyx`, but the visible WeTTY terminal does not reliably follow that selection.

In practice, clicking a session button updates app state and the remote `~/.lcars-selected-session` file, but the persistent shell shown in the center pane often remains attached to a different tmux session, or lands in a fresh shell that is not attached to the intended tmux viewer session at all.

## Current architecture

- Frontend session buttons are rendered by `src/components/SessionCommands.tsx`
- Button clicks call `POST /api/tmux/select`
- The Bun bridge in `server/index.ts` SSHes to `zac@192.168.1.238`
- The bridge writes the selected tmux session into `~/.lcars-selected-session`
- The bridge then tries to switch the active tmux client using the tty stored in `~/.lcars-view-tty`
- WeTTY is embedded in the center pane via `src/components/TerminalPane.tsx`
- WeTTY connects through Docker using the SSH host alias in `ops/wetty/config`
- That SSH alias runs `~/.local/bin/lcars-view` on `nyx`
- The wrapper script source in this repo is `ops/nyx/lcars-view`

## What is known to work

### Frontend and API path

- The frontend can fetch tmux sessions successfully
- The frontend can fetch the current selected session successfully
- Clicking a right-side session button successfully calls `POST /api/tmux/select`
- The API responds with the new selected session

### Remote tmux state

- `tmux list-sessions -F '#{session_name}'` works remotely
- `~/.lcars-selected-session` is updated correctly by the bridge
- Manual tmux switching works when the correct client tty is targeted
- Example: manually running `tmux switch-client -c '/dev/pts/3' -t robot` on `nyx` successfully moves that client

### Viewer tty tracking

- The wrapper originally failed to record the correct tty reliably
- Updating `ops/nyx/lcars-view` to write `SSH_TTY` improved this
- After reinstalling the wrapper on `nyx`, `~/.lcars-view-tty` correctly contained the WeTTY client tty, for example `/dev/pts/3`

## What is not working

### Visible terminal does not follow selection consistently

- The visible WeTTY pane can remain attached to the old tmux session even after the API reports success
- In some runs, the selected session changes in state, but the actual tmux client shown in WeTTY does not move

### WeTTY login path is not consistently landing in the intended tmux viewer flow

- Autologin to WeTTY works
- However, the resulting shell can still be a fresh shell instead of an attached tmux viewer session
- When that happens, changing tmux client state has no visible effect in the terminal pane because the pane is not actually attached to the expected tmux client

## Root-cause hypothesis

There appear to be two related problems.

### 1. The WeTTY SSH session is not guaranteed to end up inside the tmux-attached viewer

Although `ops/wetty/config` specifies:

- `HostName 192.168.1.238`
- `User zac`
- `RequestTTY force`
- `RemoteCommand ~/.local/bin/lcars-view`

the actual WeTTY session sometimes still lands in a plain shell.

If WeTTY is not actually running inside the `lcars-view` wrapper flow, then:

- `~/.lcars-view-tty` may point to an older tty
- or the tty may point to a client that is no longer the visible pane
- or there may be no live tmux client corresponding to what the iframe currently shows

That makes `tmux switch-client` ineffective from the user's perspective, even if it succeeds against some tmux client.

### 2. The bridge/viewer coupling is tty-based and fragile

The bridge currently assumes:

- the viewer tty stored in `~/.lcars-view-tty` is always the active visible WeTTY client
- tmux client switching can be driven entirely by targeting that tty

This is fragile because:

- reconnecting WeTTY can create a new tty
- stale tty state can remain in `~/.lcars-view-tty`
- there may be multiple tmux clients attached at once
- a successful selection update does not necessarily mean the visible iframe is attached to the targeted client

## Evidence collected so far

### API state can diverge from visible terminal state

Observed behavior:

- `GET /api/tmux/current` can return `robot`, `foobar`, or `zapplebot` correctly
- `GET /api/tmux/sessions` returns the expected sessions
- But `tmux list-clients -F '#{client_tty} #{session_name}'` can still show the visible client attached elsewhere

### Manual tmux command behavior

Manual testing on `nyx` showed:

- `tmux switch-client -c '/dev/pts/3' -t foobar` works when `/dev/pts/3` is the actual viewer tty
- This confirms tmux itself is capable of doing the switch
- The remaining issue is ensuring that the tty being switched is the same one the iframe is actually displaying

## Likely problem areas to investigate next

### WeTTY / SSH startup path

- Confirm whether `--ssh-config /wetty-config/config` is truly being honored by the WeTTY Docker runtime during the live app flow
- Confirm whether `RemoteCommand ~/.local/bin/lcars-view` actually runs for the autologin path `/wetty/ssh/zac?pass=...`
- Confirm whether WeTTY is spawning a login flow that bypasses the configured remote command

### `lcars-view` wrapper behavior

- Confirm the wrapper is installed at `~/.local/bin/lcars-view` on `nyx`
- Confirm it is executable
- Confirm it is actually the process backing the WeTTY shell
- Confirm it always writes the current `SSH_TTY` before `tmux attach-session`
- Confirm it does not fall through to a plain login shell unexpectedly

### Better viewer identity

- Replace tty-file tracking with a more robust viewer identity if possible
- Consider a dedicated tmux client/session model instead of targeting a raw tty from a file
- Consider a stable wrapper that always reattaches itself based on selected session state rather than relying on `switch-client` into a specific tty

## Current implementation details relevant to the bug

### Frontend

- `src/components/SessionCommands.tsx`
  - fetches sessions and current selection
  - posts selected session changes

- `src/components/TerminalPane.tsx`
  - loads WeTTY in an iframe
  - currently uses an autologin URL with `?pass=`

### Backend

- `server/index.ts`
  - `GET /api/tmux/sessions`
  - `GET /api/tmux/current`
  - `POST /api/tmux/select`
  - writes `~/.lcars-selected-session`
  - attempts `tmux switch-client -c "$viewer_tty" -t "$selected"`

### Remote scripts/config

- `ops/wetty/config`
  - SSH alias for WeTTY connection
  - intended to force `RemoteCommand ~/.local/bin/lcars-view`

- `ops/nyx/lcars-view`
  - intended to:
    - read selected session state
    - record current SSH tty to `~/.lcars-view-tty`
    - attach to the selected tmux session

## Expected behavior

When the user clicks a right-side session button:

1. the Bun bridge should update the selected session on `nyx`
2. the same persistent WeTTY terminal visible in the pane should move to that tmux session
3. the active highlighted button should match what the terminal is actually showing

## Actual behavior

When the user clicks a right-side session button:

1. the selected session state updates
2. the UI may highlight the new session
3. but the visible WeTTY pane can stay on the old session, or be in a fresh non-tmux shell entirely

## Suggested next debugging steps

1. Verify the live WeTTY process on `nyx` is actually running `lcars-view`, not falling back to a normal shell
2. Log `SSH_TTY`, selected session, and attach target inside `lcars-view`
3. Test whether the WeTTY autologin path bypasses `RemoteCommand`
4. If it does, move to a startup method that guarantees the wrapper runs
5. If tty-based switching remains flaky, redesign around a more stable tmux viewer session/client model instead of `~/.lcars-view-tty`

## Current conclusion

The button click path is mostly working. The failure is not in the React controls or basic API transport. The likely fault is in the final handoff between the selected tmux state and the specific shell client that WeTTY is actually displaying.

The most probable explanation is that the visible WeTTY shell is not consistently the same tmux-attached viewer client that the bridge thinks it is switching.
