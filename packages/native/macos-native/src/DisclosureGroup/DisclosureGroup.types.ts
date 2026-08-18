import type { PropsWithChildren } from 'react';
import type { ViewProps } from 'react-native';

/**
 * Thin wrapper around SwiftUI's `DisclosureGroup`.
 * https://developer.apple.com/documentation/swiftui/disclosuregroup
 */
export type DisclosureGroupProps = PropsWithChildren<
  ViewProps & {
    /** Text shown in the disclosure control's label. */
    label: string;
    /** Whether the content is currently expanded. */
    expanded?: boolean;
    /** Initial expansion state when `expanded` is omitted. Defaults to false. */
    defaultExpanded?: boolean;
    /** Disables expansion and collapse interaction. */
    disabled?: boolean;
    /** Fired when the user expands or collapses the group. */
    onExpandedChange?: (expanded: boolean) => void;
  }
>;
