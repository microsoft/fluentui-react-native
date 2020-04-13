import * as React from 'react'
import styled from '@emotion/styled'
import { useRootStyles } from './useRootStyles'

type SliderChangeEvent = React.ChangeEvent<HTMLInputElement>

const StyleTest: React.FC = () => {
  const [hue, setHue] = React.useState(0)
  const [saturation, setSaturation] = React.useState(50)
  const [lightness, setLightness] = React.useState(50)
  useRootStyles({ '--hue': hue, '--saturation': saturation, '--lightness': lightness })

  const handleHueChange = (event: SliderChangeEvent) => setHue(parseInt(event.target.value, 10))
  const handleSaturationChange = (event: SliderChangeEvent) => setSaturation(parseInt(event.target.value, 10))
  const handleLightnessChange = (event: SliderChangeEvent) => setLightness(parseInt(event.target.value, 10))

  return (
    <StoryLayout>
      <Swatch />

      <fieldset>
        <Label htmlFor="hue">Hue</Label>
        <Slider name="hue" type="range" min={0} max={360} value={hue} onChange={handleHueChange} />
        <Label htmlFor="saturation">Saturation</Label>
        <Slider name="saturation" type="range" min={0} max={100} value={saturation} onChange={handleSaturationChange} />
        <Label htmlFor="lightness">Lightness</Label>
        <Slider name="lightness" type="range" min={0} max={100} value={lightness} onChange={handleLightnessChange} />
      </fieldset>
    </StoryLayout>
  )
}

const Swatch = styled.div`
  background-color: hsl(var(--hue), calc(var(--saturation) * 1%), calc(var(--lightness) * 1%));
  width: 80px;
  height: 80px;
`

const StoryLayout = styled.div`
  display: flex;
  height: 100vh;
  width: 100vw;
  align-items: center;
  justify-content: center;

  fieldset {
    width: 300px;
    border: none;
  }
`

const Label = styled.label`
  text-transform: uppercase;
  font-family: sans-serif;
  font-size: 14px;
  color: hsl(0, 0%, 50%);
  display: inline-block;
  width: 120px;
  text-align: right;
  padding-right: 8px;
`

const Slider = styled.input`
  display: inline-block;
  width: 140px;
`

export default { title: 'StyleTest', component: StyleTest }

export const ToStorybook = () => <StyleTest />
ToStorybook.story = { name: 'Basic' }
