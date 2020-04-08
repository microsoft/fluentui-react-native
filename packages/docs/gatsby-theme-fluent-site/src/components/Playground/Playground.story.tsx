import React from 'react'
import { Playground } from '.'
import { Global, css } from '@emotion/core'

export default {
  title: 'Playground',
  component: Playground,
}

// TODO: should share this with the main app and other stories.
const GlobalStyles = () => (
  <Global
    styles={css`
      body {
        font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji',
          'Segoe UI Emoji', 'Segoe UI Symbol';
      }
    `}
  />
)

export const ToStorybook = () => {
  const examples = [
    {
      title: 'Hello World',
      description: 'Description for the first example',
      source: `import * as React from "react"

export default () => <h1>Hello World!</h1>`,
    },
    {
      title: 'Goodbye World',
      description: 'Description for the second example',
      source: `import * as React from "react"

export default () => <h1>Goodbye World?</h1>`,
    },
    {
      title: 'RTL Example',
      description: 'Description for the third example',
      source: `import * as React from "react"

export default () => (
    <div style={{
        display: "grid",
        gridAutoFlow: "column",
        gridAutoColumns: "min-content",
        gridGap: "1rem",
    }}>
        <button style={{ padding: "1rem", fontWeight: 800, background: "red", color: "#fff" }}>Cancel</button>
        <button style={{ padding: "1rem", fontWeight: 800, background: "blue", color: "#fff" }}>Confirm</button>
    </div>
)`,
    },
    {
      title: 'Theme Example',
      description: 'Description for the third example',
      source: `import * as React from "react"

export default ({ theme }) => {
    const style = {
        padding: "1rem"
    }
    switch (theme) {
        case "Dark":
            style.background = "#333"
            style.color = "#eee"
        break
        case "High Contrast":
            style.background = "#000"
            style.color = "#fff"
        break
    }
    return <h1 style={style}>Current theme: {theme}</h1>
}`,
    },
  ]
  const themes = ['Light', 'Dark', 'High Contrast']
  return (
    <>
      <GlobalStyles />
      <Playground themes={themes} examples={examples} />
    </>
  )
}

ToStorybook.story = {
  name: 'Basic',
}
