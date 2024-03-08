import * as React from 'react';

import { ButtonV1 } from '@fluentui-react-native/button';
import { checkRenderConsistency, checkReRender } from '@fluentui-react-native/test-tools';
import * as renderer from 'react-test-renderer';

import { Overflow, OverflowItem } from '../';

const items = ['a', 'b', 'c'];

describe('Overflow component tests', () => {
  it('Overflow default', () => {
    const tree = renderer
      .create(
        <Overflow itemIDs={items}>
          {items.map((item) => (
            <OverflowItem key={item} overflowID={item}>
              <ButtonV1>{item}</ButtonV1>
            </OverflowItem>
          ))}
        </Overflow>,
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Overflow simple rendering does not invalidate styling', () => {
    checkRenderConsistency(
      () => (
        <Overflow itemIDs={items}>
          {items.map((item) => (
            <OverflowItem key={item} overflowID={item}>
              <ButtonV1>{item}</ButtonV1>
            </OverflowItem>
          ))}
        </Overflow>
      ),
      2,
    );
  });

  it('Overflow re-renders correctly', () => {
    checkReRender(
      () => (
        <Overflow itemIDs={items}>
          {items.map((item) => (
            <OverflowItem key={item} overflowID={item}>
              <ButtonV1>{item}</ButtonV1>
            </OverflowItem>
          ))}
        </Overflow>
      ),
      2,
    );
  });

  // Feel free to add more tests here
});
