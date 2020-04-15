import * as React from 'react'

export const useKeyPress = targetKey => {
  const [keyPressed, setKeyPressed] = React.useState(false)

  function downHandler({ key }) {
    if (key === targetKey) {
      setKeyPressed(true)
    }
  }

  React.useEffect(() => {
    window.addEventListener('keydown', downHandler)
    // cleanup
    return () => {
      window.removeEventListener('keydown', downHandler)
    }
  }, [])

  return keyPressed
}
