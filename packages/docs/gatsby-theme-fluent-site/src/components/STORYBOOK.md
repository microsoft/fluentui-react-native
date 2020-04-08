# Storybook

Building isolated, reusable components is one of our project goals. If you are starting work on a new feature or want to isolate a component for development / debugging, it is recommended to use [Storybook][storybook].

## Running Storybook

```sh
yarn storybook
```

## Adding a story

To add a story to Storybook, place a `<Component>.story.tsx` (Example: Button.story.tsx) file in your component directory and `yarn storybook` from the command line.

## Writing a story

You can reference the [Storybook documentation][storybookdocs] for an introduction on “Writing Stories”.

You can find examples of stories in this repository by searching for `.story.tsx` files.

```jsx
import React from 'react'
import { BasicPlayground } from '.'

export default {
  title: 'Playground',
  component: Playground,
}

export const ToStorybook = () => <BasicPlayground />

ToStorybook.story = {
  name: 'Basic Playground',
}
```

[storybook]: https://storybook.js.org/
[storybookdocs]: https://storybook.js.org/basics/writing-stories/
