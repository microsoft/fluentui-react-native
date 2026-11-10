import { render } from '../renderWithTheme';

import { FluentSvg } from './fluentSvg';

describe('FluentSvg', () => {
  it('draws a sized glyph in a viewBox of its own size', async () => {
    const component = await render(<FluentSvg size={16} testID="svg" />);

    expect(component.getByTestId('svg').props).toMatchObject({ height: 16, vbHeight: 16, vbWidth: 16, width: 16 });
  });

  it('draws a resizable glyph at 24 by 24 in a 20 by 20 viewBox', async () => {
    const component = await render(<FluentSvg testID="svg" />);

    expect(component.getByTestId('svg').props).toMatchObject({ height: 24, vbHeight: 20, vbWidth: 20, width: 24 });
  });

  it('lets explicit dimensions and viewBox win over the optical size', async () => {
    const component = await render(<FluentSvg height={30} size={16} testID="svg" viewBox="0 0 10 12" width={28} />);

    expect(component.getByTestId('svg').props).toMatchObject({ height: 30, vbHeight: 12, vbWidth: 10, width: 28 });
  });

  it('labels the glyph with its title unless an accessibility label is given', async () => {
    const titled = await render(<FluentSvg testID="svg" title="Star" />);
    const labelled = await render(<FluentSvg accessibilityLabel="Favorite" testID="svg" title="Star" />);

    expect(titled.getByTestId('svg').props.accessibilityLabel).toBe('Star');
    expect(labelled.getByTestId('svg').props.accessibilityLabel).toBe('Favorite');
  });

  it('forwards the color and fills with the current color when one is given', async () => {
    const component = await render(<FluentSvg color="red" testID="svg" />);

    expect(component.getByTestId('svg').props).toMatchObject({ color: 'red', fill: 'currentColor' });
  });

  it('keeps the SVG default fill when there is no color for the current color to resolve to', async () => {
    const component = await render(<FluentSvg size={16} testID="svg" />);

    expect(component.getByTestId('svg').props.fill).toBeUndefined();
  });

  it('prefers an explicit primary fill over the current color', async () => {
    const component = await render(<FluentSvg color="red" primaryFill="blue" testID="svg" />);

    expect(component.getByTestId('svg').props).toMatchObject({ color: 'red', fill: 'blue' });
  });

  it('adds no accessibility semantics of its own', async () => {
    const component = await render(<FluentSvg size={16} testID="svg" />);
    const { props } = component.getByTestId('svg');

    expect(props.accessibilityRole).toBeUndefined();
    expect(props['aria-hidden']).toBeUndefined();
    expect(props.role).toBeUndefined();
  });
});
