# StoryStatus contract

`StoryStatus` exposes changing text to native desktop automation without
creating a second accessible text element.

- **STS-001:** Render one accessible View with the exact string as its
  accessibility label and text role. Render the visible Text child as
  inaccessible.
- **STS-002:** Require a string `testID`; forward the caller's native View ref
  and other non-owned View props without replacing the component-owned
  accessible label or role.
- **STS-003:** A changed string updates both the visible text and the
  accessible label. The component does not announce live-region changes or
  take focus.
- **STS-004:** The helper does not read theme tokens or add component styling.
