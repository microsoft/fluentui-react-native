import type { ShimmerRectElement, ShimmerCircleElement } from '@fluentui-react-native/experimental-shimmer';

export function shimmerRects(): Array<ShimmerRectElement | ShimmerCircleElement> {
  return [
    {
      type: 'rect',
      borderRadiusX: 3,
      borderRadiusY: 3,
      width: 100,
      height: 20,
      x: 90,
      y: 70,
    },
    {
      type: 'rect',
      borderRadiusX: 3,
      borderRadiusY: 3,
      width: 150,
      height: 20,
      x: 90,
      y: 42,
    },
    {
      type: 'rect',
      borderRadiusX: 3,
      borderRadiusY: 3,
      width: 200,
      height: 20,
      x: 90,
      y: 15,
    },
  ];
}

export function shimmerRectsAndRect(): Array<ShimmerRectElement | ShimmerCircleElement> {
  return shimmerRects().concat([{ type: 'rect', borderRadiusX: 3, borderRadiusY: 3, height: 60, width: 60, x: 10, y: 25 }]);
}

export function shimmerRectsAndCircle(): Array<ShimmerRectElement | ShimmerCircleElement> {
  return shimmerRects().concat([{ type: 'circle', radius: 30, cx: 40, cy: 55 }]);
}
/**
 * Matches rectsRoundRectsCircles.svg to show the border radii all create equal width/height rounded rects.
 */
export function shimmerBorderRadiusTests(): Array<ShimmerRectElement | ShimmerCircleElement> {
  return [
    { type: 'rect', x: 10, y: 10, borderRadiusX: 0, borderRadiusY: 0, width: 240, height: 120 },
    { type: 'rect', x: 250, y: 10, borderRadiusX: 50, borderRadiusY: 30, width: 240, height: 120 },
    { type: 'rect', x: 490, y: 10, borderRadiusX: 40, borderRadiusY: 40, width: 240, height: 120 },
    { type: 'rect', x: 10, y: 130, borderRadiusX: 50, borderRadiusY: 30, width: 240, height: 120 },
    { type: 'rect', x: 250, y: 130, borderRadiusX: 40, borderRadiusY: 40, width: 240, height: 120 },
    { type: 'circle', cx: 550, cy: 190, radius: 60 },
    { type: 'circle', cx: 670, cy: 190, radius: 60 },
  ];
}
