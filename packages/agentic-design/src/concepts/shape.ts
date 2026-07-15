import type { ViewStyle } from 'react-native';
import { cornerRadius40, cornerRadius20, cornerRadiusCircular, cornerRadiusNone } from '../tokens/global.generated';

export const SHAPE_RADIUS = {
  circular: cornerRadiusCircular,
  square: cornerRadiusNone,
  rounded: cornerRadius40,
} as const;
export type Shape = keyof typeof SHAPE_RADIUS;

/**
 * A type that represents a shape token or style, specifically the border radius of a shape.
 */
export type ShapeTokenOrStyle = { borderRadius: ViewStyle['borderRadius'] };

export function shapeRadius(shape: Shape): ViewStyle['borderRadius'] {
  return SHAPE_RADIUS[shape];
}

/**
 * A memoized function that returns a style object for a given shape, ensuring stable object identity for the lifetime of the
 * application. Objects are built on demand and cached for future calls. The returned borderRadius will be undefined if the
 * shape is not valid.
 *
 * @param shape the requested shape
 * @returns A style/token object corresponding to the requested shape, with a stable object identity.
 */
export const shapeStyle = (() => {
  const shapeTokensOrStyles: Partial<Record<Shape, ShapeTokenOrStyle>> = {};
  return (shape: Shape) => {
    return (shapeTokensOrStyles[shape] ??= { borderRadius: SHAPE_RADIUS[shape] });
  };
})();

/**
 * Create a token object which maps each supported shape to its corresponding shape token/style object.
 *
 * @param supportedShapes An array of supported shape keys for which to generate shape tokens.
 * @returns A record mapping each supported shape to its corresponding shape token or style object.
 */
export function shapeTokens<TSupportedShapes extends Shape = Shape>(
  supportedShapes: TSupportedShapes[],
): Record<TSupportedShapes, ShapeTokenOrStyle> {
  const tokens = {} as Record<TSupportedShapes, ShapeTokenOrStyle>;
  for (const shape of supportedShapes) {
    tokens[shape] = shapeStyle(shape);
  }
  return tokens;
}

/**
 * A constant that represents a tight corner radius, used in a few sets of tokens for Badge components.
 */
export const tightCornerRadius = cornerRadius20;
