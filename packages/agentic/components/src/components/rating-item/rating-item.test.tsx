import { StyleSheet } from 'react-native';
import { render } from '../../common/renderWithTheme';
import { Icon } from '../../primitives/icon/icon';
import { RatingItem } from './rating-item';
import { starAssets } from './rating-item.assets';

const includeHidden = { includeHiddenElements: true };

describe('RatingItem', () => {
  it('clips the preview at logical start and restores committed fill when the preview goes away', async () => {
    const tree = await render(<RatingItem fill="empty" preview="half" testID="star" />);
    const clip = () => {
      const [frame] = tree.getByTestId('star', includeHidden).children;
      if (!frame || typeof frame === 'string') return undefined;
      const mask = frame.children.find((node) => typeof node !== 'string' && StyleSheet.flatten(node.props.style)?.overflow === 'hidden');
      return typeof mask === 'string' ? undefined : mask;
    };
    expect(StyleSheet.flatten(clip()?.props.style)).toMatchObject({ start: 0, width: '50%' });

    await tree.rerender(<RatingItem fill="empty" preview="half" disabled testID="star" />);
    expect(clip()).toBeUndefined();
    await tree.rerender(<RatingItem fill="half" preview="full" testID="star" />);
    expect(clip()).toBeUndefined();
    await tree.rerender(<RatingItem fill="half" testID="star" />);
    expect(clip()).toBeDefined();
  });

  it.each([
    ['small', 12, starAssets.Star12Regular, starAssets.Star12Filled],
    ['medium', 16, starAssets.Star16Regular, starAssets.Star16Filled],
    ['large', 20, starAssets.Star20Regular, starAssets.Star20Filled],
  ] as const)('uses aligned %s artwork for each fill', async (size, pixels, regular, filled) => {
    const tree = await render(
      <>
        <Icon svgSource={regular()} testID="regular" />
        <Icon svgSource={filled()} testID="filled" />
        <RatingItem size={size} fill="empty" testID="empty" />
        <RatingItem size={size} fill="half" testID="half" />
        <RatingItem size={size} fill="full" testID="full" />
      </>,
    );
    const paths = (id: string) =>
      tree
        .getByTestId(id, includeHidden)
        .queryAll((node) => node.type === 'RNSVGPath')
        .map((node) => node.props.d);
    const [outline] = paths('regular');
    const [solid] = paths('filled');
    expect(outline).toBeDefined();
    expect(outline).not.toBe(solid);
    expect(paths('empty')).toEqual([outline]);
    expect(paths('half')).toEqual([outline, solid]);
    expect(paths('full')).toEqual([solid]);

    const frames = tree.getByTestId('half', includeHidden).queryAll((node) => node.type === 'RNSVGSvgView');
    expect(frames.map(({ props }) => [Number(props.bbWidth), Number(props.bbHeight), props.accessible, props.pointerEvents])).toEqual([
      [pixels, pixels, false, 'none'],
      [pixels, pixels, false, 'none'],
    ]);
  });

  it('removes the entire visual subtree from accessibility and hit testing', async () => {
    const tree = await render(<RatingItem fill="half" testID="star" />);
    expect(tree.getByTestId('star', includeHidden).props).toMatchObject({
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
      pointerEvents: 'none',
    });
    expect(tree.queryByRole('image', includeHidden)).toBeNull();
    expect(tree.queryByRole('button', includeHidden)).toBeNull();
  });
});
