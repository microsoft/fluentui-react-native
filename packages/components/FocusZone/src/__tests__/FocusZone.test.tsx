import { act } from 'react';
import { Button } from 'react-native';

import * as renderer from 'react-test-renderer';

import { FocusZone } from '..';

const onPress = () => {
  return;
};

describe('FocusZone No Props', () => {
  it('No children', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<FocusZone />);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('One child', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FocusZone>
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Two children', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FocusZone>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Three children', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FocusZone>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});

describe('FocusZone With Props', () => {
  it('defaultTabbableElement Prop', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FocusZone defaultTabbableElement={null}>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('focusZoneDirection Prop', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FocusZone focusZoneDirection="bidirectional">
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('disabled Prop', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FocusZone disabled={true}>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('isCircularNavigation Prop', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FocusZone isCircularNavigation={true}>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('use2DNavigation Prop', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
        <FocusZone use2DNavigation={true}>
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
          <Button title="button" onPress={onPress} />
        </FocusZone>,
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('All Props', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(
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
      );
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
