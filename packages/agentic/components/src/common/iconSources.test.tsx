import { render } from './renderWithTheme';

import type { SvgIconSource } from '../primitives/icon/icon.types';
import { semanticIconSources, withDefaultIconSource } from './iconSources';

const DefaultIcon: SvgIconSource = () => null;
const CallerIcon: SvgIconSource = () => null;

describe('withDefaultIconSource', () => {
  const transform = withDefaultIconSource(DefaultIcon);

  it('supplies the default SVG source when the caller chose none', () => {
    expect(transform({ height: 16, width: 16 })).toEqual({ height: 16, svgSource: DefaultIcon, width: 16 });
  });

  it.each([
    ['font', { fontSource: { codepoint: 0x2605, fontFamily: 'Arial' } }],
    ['image', { imageSource: { uri: 'icon.png' } }],
    ['SVG', { svgSource: CallerIcon }],
  ] as const)('keeps the %s source the caller chose', (_kind, source) => {
    const props = { height: 16, ...source };

    expect(transform(props)).toEqual(props);
  });
});

describe('semanticIconSources', () => {
  it.each(Object.entries(semanticIconSources))('draws %s at the requested size', async (_name, Source) => {
    const component = await render(<Source height={16} testID="icon" width={16} />);

    expect(component.getByTestId('icon').props).toMatchObject({ height: 16, width: 16 });
  });
});
