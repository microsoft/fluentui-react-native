# Desktop driver development

- Keep the protocol, client, authoring, and fake-host layers platform-neutral.
- Do not import Storybook, React, or React Native from this package.
- Put future operating-system integrations behind `DesktopHost`; do not branch
  on `process.platform` outside host-provider selection.
- Register targets on the server. Never accept arbitrary commands, environment
  variables, or output paths from WebDriver capabilities.
- Preserve attached applications and clean up only resources recorded as owned.
- Run this package's declared format, lint, build, and test scripts before
  repository-level validation.
