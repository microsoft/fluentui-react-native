import { Button } from 'react-native';

import * as renderer from 'react-test-renderer';

import { FocusZone } from '..';

const onPress = () => {
  return;
};

describe('FocusZone No Props', () => {
  it('No children', () => {
    const tree = renderer.create(<FocusZone />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('One child', () => {
    const tree = renderer
      .create(
        <FocusZone>
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Two children', () => {
    const tree = renderer
      .create(
        <FocusZone>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Three children', () => {
    const tree = renderer
      .create(
        <FocusZone>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('FocusZone With Props', () => {
  it('defaultTabbableElement Prop', () => {
    const tree = renderer
      .create(
        <FocusZone defaultTabbableElement={null}>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('focusZoneDirection Prop', () => {
    const tree = renderer
      .create(
        <FocusZone focusZoneDirection="bidirectional">
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('disabled Prop', () => {
    const tree = renderer
      .create(
        <FocusZone disabled={true}>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('isCircularNavigation Prop', () => {
    const tree = renderer
      .create(
        <FocusZone isCircularNavigation={true}>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('use2DNavigation Prop', () => {
    const tree = renderer
      .create(
        <FocusZone use2DNavigation={true}>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('All Props', () => {
    const tree = renderer
      .create(
        <FocusZone
          disabled={false}
          use2DNavigation={true}
          defaultTabbableElement={null}
          isCircularNavigation={false}
          focusZoneDirection="vertical"
        >
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
