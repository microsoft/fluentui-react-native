import * as React from 'react';
import { Alert } from 'react-native';

import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import { Link } from '../Link';

describe('Link component tests', () => {
  it('Default Link', () => {
    const tree = renderer.create(<Link url="https://www.bing.com">Link to Bing</Link>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Default Link as a pressable', () => {
    const doPress = (): void => {
      Alert.alert('Alert.', 'You have been alerted.');
    };
    const tree = renderer.create(<Link onPress={doPress}>Link to Bing</Link>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Inline Link', () => {
    const tree = renderer
      .create(
        <Link inline url="https://www.bing.com">
          Link to Bing
        </Link>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Subtle Link', () => {
    const tree = renderer
      .create(
        <Link appearance="subtle" url="https://www.bing.com">
          Link to Bing
        </Link>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Link simple rendering does not invalidate styling', () => {
    checkRenderConsistency(() => <Link url="https://www.bing.com">Link to Bing</Link>, 2);
  });

  it('Link re-renders correctly', () => {
    checkReRender(() => <Link url="https://www.bing.com">Render twice</Link>, 2);
  });

  it('Link shares produced styles across multiple renders', () => {
    const style = { color: 'black' };
    checkRenderConsistency(
      () => (
        <Link style={style} url="https://www.bing.com">
          Shared styles
        </Link>
      ),
      2,
    );
  });

  it('Link re-renders correctly with style', () => {
    const style = { color: 'black' };
    checkReRender(
      () => (
        <Link style={style} url="https://www.bing.com">
          Shared Style Render
        </Link>
      ),
      2,
    );
  });
});
