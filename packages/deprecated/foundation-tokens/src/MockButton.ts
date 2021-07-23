import {
  IMockTextTokens,
  IMockColorTokens,
  IMockBorderTokens,
  IMockForegroundColorTokens,
  IMockCaptionTextTokens,
  standardTextTokens,
  standardForegroundColorTokens,
  standardBackgroundColorTokens,
  standardBorderTokens,
  standardCaptionTokens,
} from './MockTokens';
import { IMockBaseProps, mockCreate, stockFakeComponent } from './MockComponent';
import { IComponentSettings } from '@uifabricshared/foundation-settings';

export type IMockTextProps = IMockTextTokens & IMockForegroundColorTokens & IMockBaseProps;
export type IMockViewProps = IMockBaseProps;
export type IMockImageProps = IMockBaseProps;

export interface IMockButtonProps extends IMockTextTokens, IMockBaseProps {
  content?: string;
  icon?: string;
}

export type IMockButtonCustomProps = IMockButtonProps & IMockColorTokens & IMockBorderTokens & IMockCaptionTextTokens;

export interface IMockTextSlotProps {
  root: IMockTextProps;
}

export interface IMockButtonSlotProps {
  root: IMockButtonCustomProps;
  content: IMockTextProps;
  subContent: IMockViewProps;
  icon: IMockImageProps;
}
export type IButtonSettings = IComponentSettings<IMockButtonSlotProps> & { tokens?: IMockButtonCustomProps };

/**
 * A mock simple text component with one slot that represents an internal text element.  This
 * supports text and fg color tokens.  These tokens should be delegated here and styles should be
 * produced by the MockText component itself for those tokens
 */
export const MockText = mockCreate<IMockTextProps, IMockTextSlotProps, IMockTextTokens & IMockForegroundColorTokens>({
  slots: {
    root: stockFakeComponent,
  },
  styles: {
    root: [standardTextTokens, standardForegroundColorTokens],
  },
});

/**
 * A mock button component that has a stock component for its root node, a sub-component for
 * text, and a stock component for the icon
 */
export const MockButton = mockCreate<IMockButtonCustomProps, IMockButtonSlotProps, IMockButtonCustomProps>({
  slots: {
    root: stockFakeComponent,
    content: MockText,
    subContent: stockFakeComponent,
    icon: stockFakeComponent,
  },
  styles: {
    root: [standardBackgroundColorTokens, standardBorderTokens],
    content: [standardTextTokens, standardForegroundColorTokens],
    subContent: [standardTextTokens, standardCaptionTokens],
    icon: [standardForegroundColorTokens],
  },
});
