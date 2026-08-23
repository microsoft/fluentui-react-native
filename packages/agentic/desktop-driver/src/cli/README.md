# Command-line interface

The `desktop-driver` binary is a JSON-oriented wrapper over package command handlers.

## Files

- `entry.ts` is the executable-only entry point.
- `args.ts` parses positional commands, repeated flags, and command-specific allowlists.
- `main.ts` dispatches commands, owns signals, shutdown sentinels, and ready-file output.
- `commands.ts` implements doctor, driver verification, generation, and Storybook control.

## Command groups

- `doctor`
- `driver detect|verify`
- `config resolve|print`
- `stories generate|list|select|args|smoke`
- `host`
- `start`
- `version`

One-shot commands print structured JSON to stdout and diagnostics to stderr. Long-lived `host`
also forwards runner output to its console, so process supervisors must use the atomic ready file
and run artifacts rather than treat the full stdout stream as one JSON document. Long-lived
commands remain in the foreground until signal or shutdown-file input.

New flags must be added to the command-specific allowlist and validated before opening a listener
or starting a process. Application-supplied values must never become runner commands or module
paths.
