import * as React from 'react'
import styled from '@emotion/styled'

const ThemeEditor = () => {
  return <p>Placeholder</p>
}

const StyledSVG = styled.svg`
  fill: currentColor;
  height: 16px;
  width: 16px;
`

export default {
  label: 'Theme Editor',
  icon: (
    <StyledSVG role="presentation" focusable="false" viewBox="8 8 16 16">
      <path d="M23.5,9C23.2239,9,23,9.2236,23,9.5v2c0,0.2759-0.2244,0.5-0.5,0.5H20h-8H9.5C9.2244,12,9,11.7759,9,11.5v-2 C9,9.2236,8.7761,9,8.5,9S8,9.2236,8,9.5v2C8,12.3271,8.6729,13,9.5,13H11v3.5c0,0.8271,0.6729,1.5,1.5,1.5H13v5.5 c0,0.1802,0.0969,0.3462,0.2537,0.4351C13.3301,23.9785,13.415,24,13.5,24c0.0891,0,0.1782-0.0239,0.2573-0.0713l5-3 C18.908,20.8384,19,20.6758,19,20.5V18h0.5c0.8271,0,1.5-0.6729,1.5-1.5V13h1.5c0.8271,0,1.5-0.6729,1.5-1.5v-2 C24,9.2236,23.7761,9,23.5,9z M20,16.5c0,0.2759-0.2244,0.5-0.5,0.5h-7c-0.2756,0-0.5-0.2241-0.5-0.5V13h8V16.5z"></path>
    </StyledSVG>
  ),
  render() {
    return <ThemeEditor />
  },
}
