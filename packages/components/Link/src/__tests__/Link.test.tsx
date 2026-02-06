import { act } from 'react';
import { Alert } from 'react-native';

import * as renderer from 'react-test-renderer';

import { Link } from '../Link';

describe('Link component tests', () => {
  it('Default Link', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Link url="https://www.bing.com">Link to Bing</Link>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Default Link as a pressable', () => {
    const doPress = (): void => {
      Alert.alert('Alert.', 'You have been alerted.');
    };
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Link onPress={doPress}>Link to Bing</Link>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Inline Link', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Link inline url="https://www.bing.com">
          Link to Bing
        </Link>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Subtle Link', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <Link appearance="subtle" url="https://www.bing.com">
          Link to Bing
        </Link>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
