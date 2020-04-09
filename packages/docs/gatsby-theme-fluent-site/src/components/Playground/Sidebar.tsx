import * as React from 'react'
import styled from '@emotion/styled'
import { usePlayground } from './context'

export const Sidebar = () => {
  const [show, setShow] = React.useState(true)
  return (
    <>
      <StyledSidebar show={show}>
        <ExampleList />
      </StyledSidebar>
      <ToggleSidebar onToggle={() => setShow(!show)} />
    </>
  )
}

const ExampleList = () => {
  const [playground, dispatch] = usePlayground()
  return (
    <SidebarPanel header="Examples">
      <StyledExampleList>
        {playground.examples.map(example => {
          const active = example.title === playground.currentExample.title
          // TODO: should probably render an actual button or anchor inside of li
          return (
            <StyledExampleListItem
              key={example.title}
              active={active}
              onClick={() => {
                dispatch({ type: 'CHANGE_EXAMPLE', payload: example })
              }}
            >
              {example.title}
            </StyledExampleListItem>
          )
        })}
      </StyledExampleList>
    </SidebarPanel>
  )
}

const ToggleSidebar = ({ onToggle }) => {
  return (
    <StyledToggleButton title="Toggle sidebar" onClick={onToggle}>
      <HamburgerIcon />
    </StyledToggleButton>
  )
}

const StyledExampleList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`

const StyledExampleListItem = styled.li<{ active: boolean }>`
  padding: 0.5rem;
  cursor: pointer;
  border: 1px solid transparent;
  border-bottom-color: #eee;
  font-size: 0.9rem;

  &:hover,
  &:focus {
    border-color: rgb(62, 66, 192);
  }

  ${props =>
    props.active && {
      background: 'rgba(62, 66, 192, 0.035)',
      color: 'rgba(62, 66, 192, 1)',
      borderColor: 'rgba(62, 66, 192, 1)',
    }}
`

const StyledSidebar = styled.aside<{ show: boolean }>`
  display: flex;
  flex-direction: column;
  width: 225px;
  margin-left: ${props => (props.show ? 0 : '-226px')};
  border-left: 1px solid #eee;
  background: #fff;
  transition: margin 150ms ease 0s;
`

export const SidebarPanel = ({ header, children }: { children: React.ReactNode; header: React.ReactNode }) => {
  const [show, setShow] = React.useState(true)
  return (
    <StyledSidebarPanel>
      <StyledSidebarPanelHeader onClick={() => setShow(!show)}>{header}</StyledSidebarPanelHeader>
      {show && <StyledSidebarPanelContent>{children}</StyledSidebarPanelContent>}
    </StyledSidebarPanel>
  )
}

const StyledSidebarPanel = styled.section``

const StyledSidebarPanelHeader = styled.header`
  padding: 0.75rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  font-weight: 600;
`

const StyledSidebarPanelContent = styled.div`
  background: rgb(249, 249, 249);
`

const HamburgerIcon = () => (
  <span role="img" aria-hidden="true">
    <svg role="presentation" focusable="false" height="16" width="16" viewBox="8 8 16 16">
      <path d="M22.49 10.47c0 .14-.05.25-.14.35s-.21.14-.35.14H9c-.14 0-.25-.05-.35-.14s-.14-.21-.14-.35.05-.25.14-.35.21-.14.35-.14h13c.14 0 .25.05.35.14s.14.21.14.35zm0 5c0 .14-.05.25-.14.35s-.21.14-.35.14H9c-.14 0-.25-.05-.35-.14s-.14-.21-.14-.35.05-.25.14-.35.21-.14.35-.14h13c.14 0 .25.05.35.14s.14.21.14.35zm0 5c0 .14-.05.25-.14.35s-.21.14-.35.14H9c-.14 0-.25-.05-.35-.14s-.14-.21-.14-.35.05-.25.14-.35.21-.14.35-.14h13c.14 0 .25.05.35.14s.14.21.14.35z"></path>
      <path d="M9 11h13c.6 0 1-.4 1-1s-.4-1-1-1H9c-.6 0-1 .4-1 1s.4 1 1 1zm13 8H9c-.6 0-1 .4-1 1s.4 1 1 1h13c.6 0 1-.4 1-1s-.4-1-1-1zm0-5H9c-.6 0-1 .4-1 1s.4 1 1 1h13c.6 0 1-.4 1-1s-.4-1-1-1z"></path>
    </svg>
  </span>
)

const StyledToggleButton = styled.button`
  position: absolute;
  top: 0;
  right: 0;
  margin: 15px 15px 0 0;
  padding: 0;
  background: none;
  border: none;
  outline: none;
  cursor: pointer;
  z-index: 2;
`
