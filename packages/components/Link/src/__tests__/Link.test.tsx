import { Alert } from 'react-native';

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
});
