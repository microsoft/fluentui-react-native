import type { RatingDisplayProps } from '../../index';

describe('RatingDisplay props', () => {
  it('allows a decorative visual without a second accessible summary', () => {
    const decorative: RatingDisplayProps = { value: 3.5, decorative: true };
    // @ts-expect-error An informative display requires localized summary text.
    const missingSummary: RatingDisplayProps = { value: 4 };
    // @ts-expect-error This display never edits a rating.
    const editable: RatingDisplayProps = { value: 4, decorative: true, onValueChange: () => {} };
    expect([decorative, missingSummary, editable]).toHaveLength(3);
  });
});
