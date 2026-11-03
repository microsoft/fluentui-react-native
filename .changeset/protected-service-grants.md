---
'@fluentui-react-native/desktop-driver': patch
---

Let the driver service authenticate callers and keep their sessions apart. Pass a `DesktopAuthority` (new `./authority` export) to `createDesktopDriverServer`, issue each caller a grant with `authority.issue({ label, targets })`, and give the typed client its token with `createDesktopDriverClient({ grant })`. A protected service answers every route, including ordinary WebDriver routes, unknown routes, and `/status`, with HTTP 401 `unauthorized` unless the request carries a valid grant, and it decides that before reading the request body. A session belongs to the grant that created it and is invisible to every other grant, a grant opens only the targets it names, and a target that is busy or quarantined reports `data.reason` `target-busy` or `target-quarantined` with the holder's label but no grant, secret, or session identifier. Revoking a grant closes its sessions. A service started without an authority behaves as before.
