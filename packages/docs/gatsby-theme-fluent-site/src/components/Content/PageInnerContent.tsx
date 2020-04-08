import * as React from 'react'
import styled from '@emotion/styled'

export const PageInnerContent = props => {
  return <StyledContent>{props.children}</StyledContent>
}

const StyledContent = styled.main`
  border-left: 1px solid #eee;
  padding: 40px;
  overflow-y: auto;
  flex-grow: 1;
`
