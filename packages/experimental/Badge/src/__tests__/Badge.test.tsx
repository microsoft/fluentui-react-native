import * as React from 'react';
import { Badge } from '../Badge';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Badge component tests', () => {
  const fontBuiltInProps = {
    fontFamily: 'Arial',
    codepoint: 0x2663,
    fontSize: 16,
  };
  it('Empty Badge', () => {
    const tree = renderer.create(<Badge />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Badge all props', () => {
    const tree = renderer
      .create(
        <Badge size="large" appearance="outline" shape="rounded" icon={{ fontSource: { ...fontBuiltInProps }, color: '#fff' }}>
          Badge
        </Badge>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Badge tokens', () => {
    const BadgeStyled = Badge.customize({
      backgroundColor: 'yellow',
      borderColor: '#f09',
      borderWidth: 4,
    });
    const tree = renderer.create(<BadgeStyled>Badge Tokens</BadgeStyled>).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Check checkRenderConsistency for Badge', () => {
    checkRenderConsistency(() => <Badge />, 2);
  });

  it('Badge re-renders correctly', () => {
    checkReRender(() => <Badge />, 2);
  });
});
