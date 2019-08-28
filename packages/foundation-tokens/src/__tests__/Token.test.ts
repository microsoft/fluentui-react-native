import { IButtonSettings, MockButton } from '../__mocks__/MockButton';
import { theme } from '../__mocks__/MockTheme';

const b1: IButtonSettings = {
  root: {
    fontSize: 'large',
    fontWeight: 900,
    color: 'buttonText',
    backgroundColor: 'buttonBackground',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#c1c1c1',
    captionColor: 'blue'
  }
};

const b1resolved: IButtonSettings = {
  root: {
    fontSize: 'large',
    fontWeight: 900,
    color: 'buttonText',
    backgroundColor: 'buttonBackground',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#c1c1c1',
    captionColor: 'blue',
    style: {
      borderColor: '#c1c1c1',
      borderWidth: 1,
      borderRadius: 2,
      backgroundColor: 'blue'
    }
  },
  content: {
    fontSize: 'large',
    fontWeight: 900,
    color: 'buttonText'
  },
  subContent: {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: 'blue'
    }
  },
  icon: {
    style: {
      color: 'yellow'
    }
  }
};

export const _b1resolvedRecurse: IButtonSettings = {
  root: {
    fontSize: 'large',
    fontWeight: 900,
    color: 'buttonText',
    backgroundColor: 'buttonBackground',
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#c1c1c1',
    captionColor: 'blue',
    style: {
      borderColor: '#c1c1c1',
      borderWidth: 1,
      borderRadius: 2,
      backgroundColor: 'blue'
    }
  },
  content: {
    fontSize: 'large',
    fontWeight: 900,
    color: 'buttonText',
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: 'yellow'
    }
  },
  subContent: {
    style: {
      fontSize: 14,
      fontWeight: 900,
      color: 'blue'
    }
  },
  icon: {
    style: {
      color: 'yellow'
    }
  }
};

describe('Token settings unit tests', () => {
  test('resolve base settings', () => {
    const cache = {};
    const resolved = MockButton({}, b1, theme, cache, false);
    expect(resolved).toEqual(b1resolved);
  });
});
