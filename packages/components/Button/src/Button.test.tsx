import { act } from 'react';
import { Pressable, Text } from 'react-native';

import { Icon } from '@fluentui-react-native/icon';
import * as renderer from 'react-test-renderer';

import { Button } from './Button';

describe('Button component tests', () => {
  it('Button default', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button>Default Button</Button>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button disabled', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button disabled>Disabled Button</Button>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button primary', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button appearance="primary">Primary Button</Button>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button subtle', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button appearance="subtle">Subtle Button</Button>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button circular', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button shape="circular">Circular Button</Button>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button square', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button shape="square">Square Button</Button>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button small', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button size="small">Small Button</Button>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button large', () => {
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<Button size="large">Large Button</Button>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button customized', () => {
    const CustomButton = Button.customize({ backgroundColor: 'pink' });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<CustomButton>Custom Button</CustomButton>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });

  it('Button composed', () => {
    const ComposedButton = Button.compose({
      slots: {
        root: Pressable,
        icon: Icon,
        content: Text,
      },
    });
    let component: renderer.ReactTestRenderer;
    act(() => {
      component = renderer.create(<ComposedButton>Composed Button with RNText</ComposedButton>);
    });
    expect(component!.toJSON()).toMatchSnapshot();
  });
});
