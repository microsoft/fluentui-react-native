# Shimmer

## Purpose

Shimmer is a temporary animation placeholder for when a service call takes time to return data and we don't want to block rendering the rest of the UI.

## Do's:

- Use shimmer to help ease a UI transition when we know the service will potentially take a longer amount of time to retrieve the data.
- Provide widths for each of the shimmer elements you used to build a skeleton layout looking as close as possible to real content it is replacing.
- Use shimmer if you know the UI loading time is longer than 1 second.

## Don't:

- Use on the same element both types of widths. It will always default to just one of them. See documentation below.
- Use shimmer if you are confident that the UI will take less than a second to load.
- Use shimmer as a way to not make improvements in your code to improve performance.

## Sample Code:

### Rectangle Shimmer

```jsx
<Stack style={stackStyle}>
  <Shimmer elements={shimmerRectsAndRect()} duration={2000} delay={1000} style={{ width: 300, height: 100 }} />
</Stack>
```

### Circle Shimmer

```jsx
<Stack style={stackStyle}>
  <Shimmer elements={shimmerRectsAndCircle()} duration={3000} style={{ width: 300, height: 100 }} />
</Stack>
```

### Customized Shimmer

```jsx
const PinkShimmer = Shimmer.customize({
  shimmerWaveColor: 'pink',
});

return (
  <Stack style={stackStyle}>
    <PinkShimmer elements={shimmerRectsAndCircle()} duration={1500} delay={500} style={{ height: 100, maxWidth: '50%' }} />
  </Stack>
);
```

## Props:

### Shimmer Component:

| Prop     | Type                         | Default Value | Description                                                           |
| -------- | ---------------------------- | ------------- | --------------------------------------------------------------------- |
| elements | `Array<ShimmerElementTypes>` |               | Shimmer shapes that define the masking effect of the Shimmer control. |

`type ShimmerElementTypes = ShimmerCircleElement | ShimmerRectElement`

### ShimmerCircleElement Type:

| Prop   | Type   | Default Value | Description                                                                                      |
| ------ | ------ | ------------- | ------------------------------------------------------------------------------------------------ |
| radius | number | 12            | Radius of the circle element.                                                                    |
| cx     | number |               | The x-axis center of the circle element in the Shimmer relative to the origin [top-left, (0,0)]. |
| cy     | number |               | The y-axis center of the circle element in the Shimmer relative to the origin [top-left, (0,0)]. |

### ShimmerRectElement Type:

| Prop          | Type   | Default Value | Description                                                                                                        |
| ------------- | ------ | ------------- | ------------------------------------------------------------------------------------------------------------------ |
| width         | number | 100%          | Width of the rect.                                                                                                 |
| height        | number | 16            | Height of the rect.                                                                                                |
| borderRadiusX | number | 0             | Border radius for the x-axis of a rounded rect.                                                                    |
| borderRadiusY | number | 0             | Border radius for the y-axis of a rounded rect.                                                                    |
| x             | number |               | he x-axis position of the rect element's top-left corner in the Shimmer relative to the origin [top-left, (0,0)].  |
| y             | number |               | The y-axis position of the rect element's top-left corner in the Shimmer relative to the origin [top-left, (0,0)]. |

## Shimmer Tokens

| Prop                    | Type             | Default Value                  | Description                                                                                                           |
| ----------------------- | ---------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| angle                   | number           | 0                              | Specifies the Shimmer effect angle in degrees (produced by a gradient)                                                |
| delay                   | number           | 0                              | Specifies the animation delay time in milliseconds                                                                    |
| duration                | number           | 2000                           | Specifies the time required to traverse the control in milliseconds                                                   |
| shimmerColorOpacity     | number           | 1                              | Specifies the opacity of the shimmer color.                                                                           |
| shimmerWaveColorOpacity | number           | 1                              | Specifies the opacity of the wave color.                                                                              |
| shimmerColor            | string or number | theme.color.bodyFrameDivider   | Color you see when the shimmer wave is not animating.                                                                 |
| shimmerWaveColor        | string or number | '#E1E1E1'                      | Defines the tip color of the wave which has a linear gradient. from shimmerColor to shimmerWaveColor to shimmerColor. |
| shimmerWaveWidth        | string or number | '100%' of the 'width' property | Width of the Shimmer wave.                                                                                            |
