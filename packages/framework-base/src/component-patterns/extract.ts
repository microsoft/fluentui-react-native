import type { ViewStyle, TextStyle, ImageStyle } from 'react-native';

type StyleTypes = ViewStyle | TextStyle | ImageStyle;
type PropsWithStyle = { style?: ViewStyle | TextStyle | ImageStyle };
type PropsWithChildren = { children?: React.ReactNode };

/**
 * Extract the props from a React element. If the element is undefined, undefined will be returned.
 * @param element The React element from which to extract the props.
 * @returns The extracted props or undefined if the element is undefined.
 */
export function extractProps<T extends object>(element?: React.ReactElement): T | undefined {
  return element ? (element.props as T) : undefined;
}

/**
 * Extract the children from a React element. If the element is undefined, undefined will be returned.
 * @param element The React element from which to extract the children.
 * @returns The extracted children or undefined if the element is undefined.
 */
export function extractChildren(element?: React.ReactElement): React.ReactNode | undefined {
  return extractProps<PropsWithChildren>(element)?.children;
}

/**
 * Extract a style object from a React element. If the element is undefined or does not have a style prop, an empty object will be returned.
 * @param element The React element from which to extract the style.
 * @returns The extracted style object or an empty object if not available.
 */
export function extractStyle<T extends StyleTypes = ViewStyle>(element?: React.ReactElement): T {
  return (extractProps<PropsWithStyle>(element)?.style as T) ?? ({} as T);
}
