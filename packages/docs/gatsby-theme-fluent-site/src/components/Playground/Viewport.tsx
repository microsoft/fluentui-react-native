import * as React from 'react'
import styled from '@emotion/styled'
import { usePlayground } from './context'
import { ExamplePreview } from './ExamplePreview'

const RESOLUTIONS = [
  { label: 'Responsive', value: 'Responsive' },
  { label: '320', value: 320 },
  { label: '640', value: 640 },
  { label: '1024', value: 1024 },
]
const ZOOM_LEVELS = [
  { label: '25%', value: 0.25 },
  { label: '50%', value: 0.5 },
  { label: '75%', value: 0.75 },
  { label: '100%', value: 1 },
  { label: '200%', value: 2 },
  { label: '300%', value: 3 },
]

export const Viewport = () => {
  const [playground, dispatch] = usePlayground()
  return (
    <StyledViewport>
      <Grid style={{ zIndex: 1, padding: '1rem' }}>
        <Select
          label="Resolution"
          options={RESOLUTIONS}
          value={playground.resolution}
          onChange={(value: any) => dispatch({ type: 'CHANGE_RESOLUTION', payload: value })}
        />
        <Select
          label="Zoom Level"
          options={ZOOM_LEVELS}
          value={playground.zoomLevel}
          onChange={(value: any) => dispatch({ type: 'CHANGE_ZOOM_LEVEL', payload: value })}
        />
      </Grid>
      <StyledExamplePreviewContainer>
        <ExamplePreview example={playground.currentExample} />
      </StyledExamplePreviewContainer>
      {playground.currentExample && (
        <div style={{ position: 'relative', padding: '1rem' }}>
          <StyledExampleTitle>{playground.currentExample.title}</StyledExampleTitle>
          <StyledExampleDescription>{playground.currentExample.description}</StyledExampleDescription>
        </div>
      )}
    </StyledViewport>
  )
}

const Select = ({ label, options, value, onChange }) => {
  const selected = options.find(opt => opt.value === value)
  return (
    <label htmlFor={label} style={{ display: 'flex', alignItems: 'center' }}>
      <StyledSelect
        id={label}
        value={selected.label}
        onChange={e => {
          const option = options.find(opt => opt.label === e.target.value)!
          onChange(option.value)
        }}
      >
        {options.map(opt => {
          return (
            <option key={opt.label} value={opt.label}>
              {opt.label}
            </option>
          )
        })}
      </StyledSelect>
    </label>
  )
}

const StyledViewport = styled.div`
  position: relative;
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
  justify-content: space-between;
  min-height: 375px;
  background: rgb(249, 249, 249);
`

const StyledSelect = styled.select`
  padding: 0;
  line-height: inherit;
  color: inherit;
`

// NOTE: this must take up 100% of the viewport height, since the example
// may render with a custom background. In that case, that background should
// appear behind the viewport's header and footer.
const StyledExamplePreviewContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
`

const StyledExampleTitle = styled.h3`
  margin: 0;
`
const StyledExampleDescription = styled.p`
  margin: 0.5rem 0;
`

const Grid = styled.div`
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: min-content;
  align-items: center;
  grid-gap: 7.5px;
`
