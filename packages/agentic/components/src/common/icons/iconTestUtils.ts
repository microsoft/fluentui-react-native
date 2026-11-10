import { Children } from 'react';
import type { ReactElement, ReactNode } from 'react';
import type { screen } from '@testing-library/react-native';
import type { SvgProps } from 'react-native-svg';

import type { FluentIconsProps } from './fluentSvg';

type RenderedHost = ReturnType<typeof screen.getByTestId>;

/** A generated Fluent icon component, such as `ChevronDown20Regular`. */
type GeneratedIcon = (props: FluentIconsProps<SvgProps>) => ReactElement;

/** Path data of every glyph path drawn under a rendered host, in document order. */
export function getRenderedIconPaths(host: RenderedHost): string[] {
  return host.queryAll((node) => node.type === 'RNSVGPath').map((node) => String(node.props.d));
}

/**
 * Path data a generated Fluent icon draws. It reads the icon's element tree instead of rendering the icon, so a test can ask
 * for it at any point without replacing `screen`.
 */
export function getGeneratedIconPaths(icon: GeneratedIcon): string[] {
  const svg = icon({}) as ReactElement<{ children?: ReactNode }>;
  return Children.toArray(svg.props.children).map((path) => String((path as ReactElement<{ d: string }>).props.d));
}
