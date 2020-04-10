import * as React from 'react'
import styled from '@emotion/styled'

export interface ExampleProps {
  children: React.ReactNode
  bad: true | undefined
}

export const Example = (props: ExampleProps) => (
  <StyledExample {...props}>
    <div>{props.children}</div>
  </StyledExample>
)

const StyledExample = styled.div<ExampleProps>`
  display: flex;
  position: relative;
  min-width: 304px;
  min-height: 96px;
  border-radius: 3px;
  padding: 1em;

  color: #808080;
  background-color: ${props => (props.bad ? '#fcedee' : '#f2f2f2')};

  user-select: none;

  & > * {
    display: block;
    margin: auto;
  }
`
