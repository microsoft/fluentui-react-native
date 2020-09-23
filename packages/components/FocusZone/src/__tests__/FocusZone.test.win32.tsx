import * as React from 'react';
import { FocusZone } from '..';
import { Button } from '../../../Button';
import * as renderer from 'react-test-renderer';

describe('FocusZone No Props', () => {
  it('No children', () => {
    const tree = renderer.create(<FocusZone />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('One child', () => {
    const tree = renderer.create(
      <FocusZone>
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Two children', () => {
    const tree = renderer.create(
      <FocusZone>
        <Button />
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Three children', () => {
    const tree = renderer.create(
      <FocusZone>
        <Button />
        <Button />
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
})

describe('FocusZone With Props', () => {
  it('defaultTabbableElement Prop', () => {
    const tree = renderer.create(
      <FocusZone defaultTabbableElement={null}>
        <Button />
        <Button />
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('focusZoneDirection Prop', () => {
    const tree = renderer.create(
      <FocusZone focusZoneDirection='bidirectional'>
        <Button />
        <Button />
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('disabled Prop', () => {
    const tree = renderer.create(
      <FocusZone disabled={true}>
        <Button />
        <Button />
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('navigateAtEnd Prop', () => {
    const tree = renderer.create(
      <FocusZone navigateAtEnd='NavigateWrap'>
        <Button />
        <Button />
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('use2DNavigation Prop', () => {
    const tree = renderer.create(
      <FocusZone use2DNavigation={true}>
        <Button />
        <Button />
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('All Props', () => {
    const tree = renderer.create(
      <FocusZone disabled={false} use2DNavigation={true} defaultTabbableElement={null} navigateAtEnd='NavigateStopAtEnds' focusZoneDirection='vertical' >
        <Button />
        <Button />
        <Button />
      </FocusZone>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
})