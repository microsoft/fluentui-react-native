/**
 * These functions are necessary to deal with the win32 platform issue of d2d1 not supporting SVG <Mask> elements.
 * We can support them indirectly by inverting a <ClipPath> element, with the troublesome issue of there being
 * no direct way to do so -- which makes sense in general, one would just use <Mask> instead.
 *
 * The most desirable interface would be a ClipPath.invert property or function and/or a toString; masking
 * is generally an inversion of clipping, but we do not have such properties or functions.  This void can
 * be filled by implementing directly (a worthwhile PR to react-native-svg) or by implementing toString functions
 * for shapes individually.  The shapes individually can be composed into a single clip path string, along with
 * a shape that covers the entire SVG canvas.  Using the evenodd clip rule, this effectively becomes a mask.
 *
 * This solution is far from ideal and may have incompatibilities with <ClipPath> features; for Shimmer, it's sufficient,
 * as we only support rounded rects and circles, with a circle being a rounded rect of borderRadius=length/2=width/2.
 */

import { ShimmerCircleElement, ShimmerRectElement } from './Shimmer.types';

// Note for explicit clarity: length and width represent the full length and width of the rect, and not
// the straight edge segments (i.e. length - 2*borderRadius).

// borderRadius[X|Y] cannot be larger than [length/2 or width]/2; it would not be able to connect to the edge
// segments of the rect if so, and will be reduced to the maximum values accordingly.
function convertRoundedRectToSvgPath(
  x: number,
  y: number,
  borderRadiusX: number,
  borderRadiusY: number,
  width: number,
  height: number,
): string {
  // Reduce borderRadii to maximum usable size.
  if (borderRadiusX * 2 > width) {
    borderRadiusX = width / 2;
  }
  if (borderRadiusY * 2 > height) {
    borderRadiusY = height / 2;
  }

  const horizontalEdgeLength = width - borderRadiusX * 2;
  const verticalEdgeLength = height - borderRadiusY * 2;
  const xAxisRotation = 0;
  const largeArcFlag = 0;
  const sweepArcFlag = 1;
  /**
   * The general manner in which we will draw our rounded rect is in the following
   * order of points.
   *
   *  - Forward (/) and back (\) slashes represent borderRadiusY and borderRadiusX, respectively.
   *  - The un-rounded rect points are represented by center dots (and steal 1 unit from the borderRadii).
   *  - x and y parameters are left out as path arguments use relative coordinates (vs absolute coordinates).
   *  - Coordinate axis aids are present to avoid counting for any necessary clarification.
   *
   *  x: arbitrary
   *  y: arbitrary
   *  width: 24
   *  height: 12
   *  borderRadiusX: 5
   *  borderRadiusY: 3
   *
   *            0123456789012345678901234
   *
   *               (1+9)         (2)
   *                 ⬇            ⬇
   * 0          •\\\\--------------\\\\•
   * 1          /                      /
   * 2          /                      /
   * 3   (8) ➡ |                      | ⬅ (3)
   * 4          |                      |
   * 5          |                      |
   * 6          |                      |
   * 7          |                      |
   * 8          |                      |
   * 9   (7) ➡ |                      | ⬅ (4)
   * 0          /                      /
   * 1          /                      /
   * 2          •\\\\--------------\\\\•
   *             ⬆                ⬆
   *            (6)              (5)
   *
   * Which would generate the following path:
   * const path = 'M {x+5} ${y+3} ' +
   *              'h 14 ' +
   *              'a 5 3 0 0 1 5 3' +
   *              'v 6 ' +
   *              'a -5 3 0 0 1 -5 3' +
   *              'h -14 ' +
   *              'a -5 -3 0 0 1 -5 -3' +
   *              'v -6 ' +
   *              'a 5 -3 0 0 1 5 -3 Z';
   */

  // We start at the left-most point of the top edge.
  // M: lift and move the pen to [x] [y] coordinates -- does not draw.
  let path: (string | number)[] = ['M', x + borderRadiusX, y];

  // draw to the right-most point of the top edge.
  // h: horizontally draw a line [n] units relative to the current pen position.
  path = path.concat(['h', horizontalEdgeLength]);

  /**
   * draw the arc for the top-right corner.  If the rect is not rounded, the arc will be 0 length.
   *  a: draw an arc relative to the current pen position with the following parameters:
   *  rx: X-axis ellipse radius
   *  ry: Y-axis ellipse radius
   *  x-axis-rotation: rotation of the ellipse relative to the current coordinate system
   *  large-arc-flag: See https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
   *  sweep-arc-flag: See https://www.w3.org/TR/SVG/paths.html#PathDataEllipticalArcCommands
   *  (dx, dy): relative end coordinate
   *
   * 'a rx ry x-axis-rotation large-arc-flag sweep-arc-flag dx dy'
   *
   * We will use x-axis-rotation = 0, large-arc-flag = 0, and sweep-arc-flag = 1 for our path generation.
   *  */
  path = path.concat(['a', borderRadiusX, borderRadiusY, xAxisRotation, largeArcFlag, sweepArcFlag, borderRadiusX, borderRadiusY]);

  /**
   * Draw to the bottom-most point of the right edge.
   * v: vertically draw a line [n] units relative to the current pen position.
   */
  path = path.concat(['v', verticalEdgeLength]);

  /**
   * Draw the arc for the bottom-right corner.
   */
  path = path.concat(['a', -borderRadiusX, borderRadiusY, xAxisRotation, largeArcFlag, sweepArcFlag, -borderRadiusX, borderRadiusY]);

  /**
   * Draw to the left-most point of the bottom edge.
   */
  path = path.concat(['h', -horizontalEdgeLength]);

  /**
   * Draw the bottom-left corner.
   */
  path = path.concat(['a', -borderRadiusX, -borderRadiusY, xAxisRotation, largeArcFlag, sweepArcFlag, -borderRadiusX, -borderRadiusY]);

  /**
   * Draw to the top-most point of the left edge.
   */
  path = path.concat(['v', -verticalEdgeLength]);

  /**
   * Draw the top-left corner.
   */
  path = path.concat(['a', borderRadiusX, -borderRadiusY, xAxisRotation, largeArcFlag, sweepArcFlag, borderRadiusX, -borderRadiusY]);

  /**
   * Finally, close the shape.  While we have manually returned to the same coordinate we started with, closing and not-closing the shape
   * can have different behavior depending on other properties.
   * z or Z: close the shape.
   */
  path = path.concat('z');

  /**
   * Join all arguments with spaces and return the completed path.
   */
  return path.join(' ');
}

export function convertRectToSvgPath(rectShape: ShimmerRectElement): string {
  // Extract necessary args and generate the corresponding path for the shape.
  return convertRoundedRectToSvgPath(
    rectShape.x ? rectShape.x : 0,
    rectShape.y ? rectShape.y : 0,
    rectShape.borderRadiusX ? rectShape.borderRadiusX : 0,
    rectShape.borderRadiusX ? rectShape.borderRadiusY : 0,
    rectShape.width ? rectShape.width : 100,
    rectShape.height ? rectShape.height : 16,
  );
}

export function convertCircleToSvgPath(circleShape: ShimmerCircleElement): string {
  const radius = circleShape.radius ? circleShape.radius : 12;

  return convertRoundedRectToSvgPath(
    circleShape.cx ? circleShape.cx - circleShape.radius : 12,
    circleShape.cy ? circleShape.cy - circleShape.radius : 12,
    radius,
    radius,
    radius * 2,
    radius * 2,
  );
}
