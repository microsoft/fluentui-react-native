import { render } from '../../common/renderWithTheme';
import { RatingDisplay } from './rating-display';

const includeHidden = { includeHiddenElements: true };
const formatNumber = new Intl.NumberFormat('de-DE', { maximumSignificantDigits: 21 }).format;
const summarize = (value: number, max: number, count?: number) =>
  `${formatNumber(value)} von ${formatNumber(max)}${count === undefined ? '' : `; ${formatNumber(count)} Bewertungen`}`;

describe('RatingDisplay', () => {
  it('retains the exact numeric value and zero reviews while rounding only the stars', async () => {
    const tree = await render(<RatingDisplay value={4.3} count={0} formatNumber={formatNumber} formatSummary={summarize} />);
    const summary = tree.getByRole('image', { name: '4,3 von 5; 0 Bewertungen' });
    expect(summary.queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(6);
    expect(tree.getByText('4,3', includeHidden)).toBeOnTheScreen();
    expect(tree.getByText('(0)', includeHidden)).toBeOnTheScreen();
    expect(tree.queryByText('4,3')).toBeNull();
    expect(tree.queryByText('(0)')).toBeNull();
    expect(tree.getByRole('image')).toBe(summary);
    expect(summary.props).toMatchObject({ focusable: false });

    await tree.rerender(<RatingDisplay value={3.25} layout="compact" formatNumber={formatNumber} formatSummary={summarize} />);
    expect(tree.getByRole('image', { name: '3,25 von 5' }).queryAll((node) => node.type === 'RNSVGSvgView')).toHaveLength(1);
    expect(tree.getByText('3,25', includeHidden)).toBeOnTheScreen();
    expect(tree.queryByText('(0)', includeHidden)).toBeNull();
  });

  it('passes positive zero to both localized outputs for a signed-zero score', async () => {
    const tree = await render(<RatingDisplay value={-0} count={-0} formatNumber={formatNumber} formatSummary={summarize} />);
    expect(tree.getByRole('image', { name: '0 von 5; 0 Bewertungen' })).toBeOnTheScreen();
    expect(tree.getByText('0', includeHidden)).toBeOnTheScreen();
    expect(tree.getByText('(0)', includeHidden)).toBeOnTheScreen();
  });

  it('does not format or render an invalid required score', async () => {
    const formatSummary = jest.fn(summarize);
    const tree = await render(<RatingDisplay value={NaN} formatSummary={formatSummary} testID="rating" />);
    expect(tree.queryByTestId('rating', includeHidden)).toBeNull();
    expect(formatSummary).not.toHaveBeenCalled();
  });

  it('renders a decorative nested result without exposing another accessible target', async () => {
    const tree = await render(<RatingDisplay value={3.5} decorative testID="rating" />);
    const root = tree.getByTestId('rating', includeHidden);
    expect(root.props).toMatchObject({ accessible: false, accessibilityElementsHidden: true, focusable: false });
    expect(tree.queryByRole('image', includeHidden)).toBeNull();
    expect(tree.queryByRole('adjustable', includeHidden)).toBeNull();
  });
});
