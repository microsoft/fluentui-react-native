import * as React from 'react';
import { Text } from 'react-native';
import { Shadow } from '../Shadow';
import * as renderer from 'react-test-renderer';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';

describe('Shadow component tests', () => {
  it('Shadow (depth=2)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow2">
          <Text>Shadow (depth=2) </Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=4)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow4">
          <Text>Shadow (depth=4)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=8)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow8">
          <Text>Shadow (depth=8) </Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=16)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow16">
          <Text>Shadow (depth=16)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=28)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow28">
          <Text>Shadow (depth=28) </Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow (depth=64)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow64">
          <Text>Shadow (depth=64)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=2)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow2brand">
          <Text>Brand shadow (depth=2)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=4)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow4brand">
          <Text>Brand shadow (depth=4)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=8)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow8brand">
          <Text>Brand shadow (depth=8)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=16)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow16brand">
          <Text>Brand shadow (depth=16)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=28)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow28brand">
          <Text>Brand shadow (depth=28)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Brand shadow (depth=64)', () => {
    const tree = renderer
      .create(
        <Shadow depth="shadow64brand">
          <Text>Brand shadow (depth=64)</Text>
        </Shadow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Shadow simple rendering does not invalidate styling', () => {
    checkRenderConsistency(
      () => (
        <Shadow depth="shadow2">
          <Text>Shadow render test</Text>
        </Shadow>
      ),
      2,
    );
  });

  it('Shadow simple rendering does not invalidate styling', () => {
    checkRenderConsistency(
      () => (
        <Shadow depth="shadow2">
          <Text>Shadow render test</Text>
        </Shadow>
      ),
      2,
    );
  });

  it('Shadow re-renders correctly', () => {
    checkReRender(
      () => (
        <Shadow depth="shadow2">
          <Text>Shadow render twice test</Text>
        </Shadow>
      ),
      2,
    );
  });
});
