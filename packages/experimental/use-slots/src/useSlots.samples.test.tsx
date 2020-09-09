/** @jsx withSlots */
import { withSlots } from './withSlots';
import { stagedComponent } from './stagedComponent';
import * as renderer from 'react-test-renderer';
import { TextProps, Text, TextStyle, View } from 'react-native';
import { mergeProps } from '@fluentui-react-native/merge-props';
import { buildUseSlots } from './buildUseSlots';

/**
 * This file contains samples and description to help explain what the useSlots hook does and why it is useful
 * for building components.
 */

describe('useSlots sample code test suite', () => {
  /**
   * The first mechanism to understand is the stagedComponent mechanic. This allows a component to be written, separating
   * hook calls and component rendering. This allows it to be safely called as a function by a higher order component, even conditionally.
   */

  /**
   * First we are going to create a wrapped text component that bolds all text. One component will be authored as a staged
   * component and one as a regular component.
   */

  const boldBaseProps: TextProps = { style: { fontWeight: '900' } };

  const BoldTextStaged = stagedComponent((props: TextProps) => {
    /**
     * This section would be where hook/styling code would go, props here would include everything coming in from the base react tree with the
     * exception of children, which will be passed in stage 2.
     */
    return (extra: TextProps, children: React.ReactNode) => {
      /**
       * extra are additional props that may be filled in by a higher order component. They should not include styling and are only props the
       * enclosing component are passing to the JSX elements
       */
      return <Text {...mergeProps(boldBaseProps, props, extra)}>{children}</Text>;
    };
  });
  BoldTextStaged.displayName = 'BoldTextStaged';

  const BoldTextUnstaged: React.FunctionComponent<TextProps> = (props: React.PropsWithChildren<TextProps>) => {
    /**
     * This has the same basic principle, we'll still leverage mergeProps for smart style merging but just render directly
     */
    const { children, ...rest } = props;
    return <Text {...mergeProps(boldBaseProps, rest)}>{children}</Text>;
  };
  BoldTextUnstaged.displayName = 'BoldTextUnstaged';

  it('Render the two bold text components', () => {
    const styleToMerge: TextStyle = { color: 'black' };
    const tree = renderer.create(
      <View>
        <BoldTextStaged style={styleToMerge}>Staged</BoldTextStaged>
        <BoldTextUnstaged style={styleToMerge}>Unstaged</BoldTextUnstaged>
      </View>,
    );
    expect(tree).toMatchSnapshot();
  });

  const headerBaseProps: TextProps = { style: { fontSize: 20 } };

  const useHeaderSlots = buildUseSlots<{ text: TextProps }>({ slots: { text: BoldTextStaged } });

  const HeaderStaged = stagedComponent((props: TextProps) => {
    const BoldText = useHeaderSlots().text;
    return (extra: TextProps, children: React.ReactNode) => {
      return <BoldText {...mergeProps(headerBaseProps, props, extra)}>{children}</BoldText>;
    };
  });

  const HeaderUnstaged: React.FunctionComponent<TextProps> = props => {
    const { children, ...rest } = props;
    return <BoldTextUnstaged {...mergeProps(headerBaseProps, rest)}>{children}</BoldTextUnstaged>;
  };

  it('Render the two header components', () => {
    const styleToMerge: TextStyle = { color: 'blue' };
    const tree = renderer.create(
      <View>
        <HeaderStaged style={styleToMerge}>Staged</HeaderStaged>
        <HeaderUnstaged style={styleToMerge}>Unstaged</HeaderUnstaged>
      </View>,
    );
    expect(tree).toMatchSnapshot();
  });
});
