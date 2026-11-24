import { fireEvent } from '@testing-library/react-native';
import { render } from '../../common/renderWithTheme';
import { Text } from '../text/text';
import { Scrollbar } from './scrollbar';

describe('Scrollbar', () => {
  it('configures one owner without suppressing its scroll callback when the indicator is hidden', async () => {
    const onScroll = jest.fn();
    const owner = { testID: 'pane', onScroll, children: <Text>Scrollable document</Text> };
    const tree = await render(<Scrollbar scrollOwner={owner} />);
    const getOwner = () => tree.getByTestId('pane');
    expect(getOwner()).toHaveProp('showsVerticalScrollIndicator', true);
    expect(getOwner()).toHaveProp('showsHorizontalScrollIndicator', false);
    await tree.rerender(<Scrollbar scrollOwner={owner} orientation="horizontal" />);
    expect(getOwner()).toHaveProp('horizontal', true);
    expect(getOwner()).toHaveProp('showsHorizontalScrollIndicator', true);
    expect(getOwner()).toHaveProp('showsVerticalScrollIndicator', false);
    await tree.rerender(<Scrollbar scrollOwner={owner} orientation="horizontal" enabled={false} />);
    expect(getOwner()).toHaveProp('showsHorizontalScrollIndicator', false);
    await fireEvent.scroll(tree.getByTestId('pane'), { nativeEvent: { contentOffset: { x: 120, y: 0 } } });
    expect(onScroll).toHaveBeenCalledTimes(1);
    expect(onScroll.mock.lastCall?.[0].nativeEvent.contentOffset).toEqual({ x: 120, y: 0 });
  });
});
