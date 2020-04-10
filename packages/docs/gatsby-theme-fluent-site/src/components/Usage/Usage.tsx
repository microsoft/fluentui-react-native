import * as React from 'react'
import { css } from '@emotion/core'
import styled from '@emotion/styled'

import { ExampleProps } from './Example'

interface UsageProps {
  children: React.ReactNode
}

export const Usage = (props: UsageProps) => {
  if (!props.children || !(typeof props.children === 'object') || !(1 in (props.children as any)))
    throw new Error('At least two children are required in <Usage>.')
  const children = props.children as React.ReactNode[]

  // TODO: Make this work outside of the MDXRenderer.
  const firstExampleIndex = children.findIndex((child: any) => child.props && child.props.mdxType === 'Example')
  if (firstExampleIndex < 0) throw new Error('At least one <Example> is required in <Usage>.')

  const examples = [...injectHeaders(children.slice(firstExampleIndex))]

  return (
    <StyledUsage
      css={css`
        grid-template-rows: repeat(${examples.length + 1}, auto);
      `}
    >
      <Description>{children.slice(0, firstExampleIndex)}</Description>
      {examples}
    </StyledUsage>
  )
}

const injectHeaders = function*(examples: React.ReactNode[]): Generator<React.ReactNode> {
  let lastExampleWasGood: boolean | null = null
  const count = examples.length
  for (let i = 0; i < count; i++) {
    const example = examples[i]
    const exampleIsGood = !((example as any)?.props as ExampleProps)?.bad
    if (exampleIsGood && lastExampleWasGood !== true) yield (<LikeThis key={i}>Like this</LikeThis>)
    else if (!exampleIsGood && lastExampleWasGood !== false) yield (<NotThis key={i}>Not this</NotThis>)
    yield example
    lastExampleWasGood = exampleIsGood
  }
}

const StyledUsage = styled.div`
  position: relative;
  margin: 1em 0 1em 0;

  display: grid;
  grid-template-columns: [description] 1fr [examples] auto;
  column-gap: 48px;
  row-gap: 4px;
`

const headerHeight = '24px'

const Description = styled.div`
  grid-column: description;
  grid-row: 1 / -1;
  margin-top: ${headerHeight};

  p:first-of-type {
    margin-top: 0;
  }

  p:last-of-type {
    margin-bottom: 0;
  }
`

const Header = css`
  height: ${headerHeight};
  padding-top: 6px;

  border-style: solid;
  border-width: 0 0 1px 0;

  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  font-variant-caps: titling-caps;

  user-select: none;
`

const LikeThis = styled.div`
  ${Header}

  border-color: #13a40e;

  color: #13a40e;

  &::before {
    content: '\\2713';
    margin-right: 0.5em;
  }
`

const NotThis = styled.div`
  ${Header}

  border-color: #e73550;

  color: #e73550;

  &::before {
    content: '\\2715';
    margin-right: 0.5em;
  }
`
