import { interactiveStatePriority } from './interactiveStatePriority';

describe('interactiveStatePriority', () => {
  it('keeps disabled ahead of pressed and hovered', () => {
    expect(interactiveStatePriority).toEqual(['disabled', 'pressed', 'hovered']);
  });
});
