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
  standardCaptionTokens
} from './MockTokens';
import { IMockBaseProps, mockCreate, stockFakeComponent } from './MockComponent';
import { IComponentSettings } from '@uifabric/theme-settings';
import { token } from './Token';

export type IMockTextProps = IMockTextTokens & IMockForegroundColorTokens & IMockBaseProps;
export type IMockViewProps = IMockBaseProps;
export type IMockImageProps = IMockBaseProps;

export interface IMockButtonProps extends IMockTextTokens, IMockBaseProps {
  content?: string;
  icon?: string;
}

export type IMockButtonCustomProps = IMockButtonProps & IMockColorTokens & IMockBorderTokens & IMockCaptionTextTokens;

export type IButtonSettings = IComponentSettings<{
  root: IMockButtonCustomProps;
  content: IMockTextProps;
  subContent: IMockViewProps;
  icon: IMockImageProps;
}>;

/**
 * A mock simple text component with one slot that represents an internal text element.  This
 * supports text and fg color tokens.  These tokens should be delegated here and styles should be
 * produced by the MockText component itself for those tokens
 */
export const MockText = mockCreate<IMockTextProps, IComponentSettings>({
  tokens: [token(standardTextTokens, 'root'), token(standardForegroundColorTokens, 'root')],
  slots: {
    root: stockFakeComponent
  }
});

/**
 * A mock button component that has a stock component for its root node, a sub-component for
 * text, and a stock component for the icon
 */
export const MockButton = mockCreate<IMockButtonCustomProps, IButtonSettings>({
  tokens: [
    token(standardTextTokens, 'content', 'subContent'),
    token(standardForegroundColorTokens, 'content', 'icon'),
    token(standardBackgroundColorTokens, 'root'),
    token(standardBorderTokens, 'root'),
    token(standardCaptionTokens, 'subContent')
  ],
  slots: {
    root: stockFakeComponent,
    content: MockText,
    subContent: stockFakeComponent,
    icon: stockFakeComponent
  }
});
