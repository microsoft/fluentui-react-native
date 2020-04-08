import * as React from 'react'
import styled from '@emotion/styled'
import CodeEditor from './plugins/CodeEditor'
import ThemeEditor from './plugins/ThemeEditor'
import { usePlayground } from './context'

const PLUGINS = [CodeEditor, ThemeEditor]

export const Footer = () => {
  return (
    <StyledFooter>
      <StyledFooterBanner>
        <PluginList />
        <StyledGrid>
          <RTLToggle />
          <ThemeSelector />
        </StyledGrid>
      </StyledFooterBanner>
      <ActivePluginOutlet />
    </StyledFooter>
  )
}

const PluginList = () => {
  const [playground, dispatch] = usePlayground()
  return (
    <StyledPluginList>
      {PLUGINS.map(plugin => {
        const active = plugin === playground.currentPlugin
        return (
          <li
            key={plugin.label}
            data-is-active={active}
            onClick={() => {
              dispatch({ type: 'TOGGLE_PLUGIN', payload: plugin })
            }}
          >
            {plugin.icon}
            {plugin.label}
          </li>
        )
      })}
    </StyledPluginList>
  )
}

const RTLToggle = () => {
  const [playground, dispatch] = usePlayground()
  return (
    <StyledInputLabel htmlFor="rtl">
      <span className="label">RTL</span>
      <StyledToggleSlider>
        <input
          id="rtl"
          type="checkbox"
          checked={playground.rtl}
          onChange={() => {
            dispatch({ type: 'TOGGLE_RTL' })
          }}
        />
        <span className="slider" />
      </StyledToggleSlider>
    </StyledInputLabel>
  )
}

const ThemeSelector = () => {
  const [playground, dispatch] = usePlayground()
  return (
    <StyledInputLabel htmlFor="theme">
      <span className="label">Theme</span>
      <StyledSelect
        id="theme"
        value={playground.currentTheme}
        onChange={e => {
          dispatch({ type: 'CHANGE_THEME', payload: e.target.value })
        }}
      >
        {playground.themes.map(theme => {
          return (
            <option key={theme} value={theme}>
              {theme}
            </option>
          )
        })}
      </StyledSelect>
    </StyledInputLabel>
  )
}

const ActivePluginOutlet = () => {
  const [playground] = usePlayground()
  const plugin = playground.currentPlugin
  if (!plugin) return null
  return <StyledPluginOutlet>{plugin.render()}</StyledPluginOutlet>
}

const StyledFooter = styled.footer``

const StyledFooterBanner = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
`

const StyledGrid = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  align-items: center;
  grid-gap: 1rem;
`

const StyledSelect = styled.select`
  padding: 0;
  line-height: inherit;
  color: inherit;
`

const StyledPluginList = styled.ol`
  list-style: none;
  padding: 0;
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  align-items: center;
  grid-gap: 1rem;

  > li {
    display: flex;
    position: relative;
    align-items: center;
    white-space: nowrap;
    border-bottom: 2px solid transparent;

    svg {
      margin-right: 0.5rem;
    }

    &:hover,
    &:focus,
    &[data-is-active='true'] {
      cursor: pointer;
      color: rgba(62, 66, 192, 1);

      &::after {
        content: '';
        position: absolute;
        width: 100%;
        bottom: -19px;
        left: 0;
        height: 2px;
        background: rgba(62, 66, 192, 1);
        box-shadow: inset 0 0 1px 0 rgb(62, 66, 192), 0 0 1px 0 rgba(62, 66, 192, 0.1), 0 0 15px 0 rgba(128, 131, 216, 0.4),
          0 2px 6px 0 rgba(111, 115, 247, 0.5), 0 2px 2px 0 rgba(104, 68, 207, 0.2);
      }
    }
  }
`

const StyledPluginOutlet = styled.div`
  padding: 1rem;
`

const StyledInputLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;

  > .label {
    margin-right: 0.5rem;
  }
`

const StyledToggleSlider = styled.span`
  position: relative;
  height: 18px;
  width: 40px;

  input {
    display: none;

    &:checked + .slider {
      background: #66bb6a;
    }

    &:checked + .slider::before {
      transform: translateX(21px);
    }
  }

  .slider {
    position: absolute;
    background-color: #ccc;
    bottom: 0;
    left: 0;
    right: 0;
    top: 0;
    transition: 200ms;
    border-radius: 1rem;

    &::before {
      background-color: #fff;
      bottom: 0px;
      content: '';
      height: 16px;
      width: 16px;
      left: 1px;
      position: absolute;
      transition: 200ms;
      border: 1px solid #bbb;
      border-radius: 100%;
    }
  }
`
