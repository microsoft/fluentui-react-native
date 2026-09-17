import type { PropsWithChildren, ReactElement } from 'react';

import { render as renderNative } from '@testing-library/react-native';
import type { RenderOptions, RenderResult } from '@testing-library/react-native';
import { ThemedRoot } from '@fluentui-react-native/design';

export function render(element: ReactElement, options: RenderOptions = {}): Promise<RenderResult> {
  const { wrapper: Wrapper, ...rest } = options;
  function Scene({ children }: PropsWithChildren) {
    return <ThemedRoot testID="test-scene-root">{Wrapper ? <Wrapper>{children}</Wrapper> : children}</ThemedRoot>;
  }
  return renderNative(element, { ...rest, wrapper: Scene });
}
