import * as React from 'react';
import { JSAvatar } from '..';
import { getInitials, validateAlphabeticalCharacters, removeTitlesFromName } from '../useAvatar';
import * as renderer from 'react-test-renderer';

const alphabeticalTestNames = [
  'Marie',
  'Aadi KaPoor',
  'Marie Beaudouin',
  'Aadi Meni KaPoor',
  'Aadi Meni Ka Jr',
  'Will Little (Teams)',
  'Will Little-Tanaka',
  '-Aadi Kapoor',
  'Richard 23 Feynman',
  '* Richard *',
  'Richard Feynman [Teams]',
  'Richard Feynman {Teams}',
];
const alphabeticalInitials = ['M', 'AK', 'MB', 'AK', 'AK', 'WL', 'WL', 'AK', 'RF', 'R', 'RF', 'RF'];
const otherTestNames = ['(206) 123-4567', '耿盈盈']; // will return this case after bug bash - '耿 James'
const namesWithTitles = ['Mr Feynman', 'Dr Richard Feynman'];
const initialsForNameWithTitles = ['F', 'RF'];

it('renders Avatar', () => {
  const tree = renderer.create(<JSAvatar />).toJSON();
  expect(tree).toMatchSnapshot();
});

describe('validateAlphabeticalCharacters method', () => {
  it('validates alphabetical characters', () => {
    for (let i = 0; i < alphabeticalTestNames.length; i++) {
      expect(validateAlphabeticalCharacters(alphabeticalTestNames[i])).toBeTruthy();
    }
    for (let i = 0; i < otherTestNames.length; i++) {
      expect(validateAlphabeticalCharacters(otherTestNames[i])).toBeFalsy();
    }
  });

  it("doesn't validate undefined name", () => {
    expect(validateAlphabeticalCharacters(undefined)).toBeFalsy();
  });
  it("doesn't validate an empty string", () => {
    expect(validateAlphabeticalCharacters('')).toBeFalsy();
  });
  it("doesn't validate null name", () => {
    expect(validateAlphabeticalCharacters(null)).toBeFalsy();
  });
});

describe('removeTitlesFromName method', () => {
  it('removes titles from the name', () => {
    const words = ['Mr', 'Faynman'];
    expect(removeTitlesFromName(words)).toStrictEqual(['Faynman']);
  });
  // it('removes multiword titles from the name', () => {
  //   const name = 'Consul General Richard Faynman';
  //   expect(removeTitlesFromName(name)).toStrictEqual(['Richard Faynman']);
  // });
});

describe('getInitials method', () => {
  it('returns correct initials', () => {
    const test = getInitials('-Test   str  with *spaces');
    expect(test).toBe('TS');
  });

  it('returns an empty string if name is undefined', () => {
    expect(getInitials(undefined)).toBe('');
  });

  it('return initials for alphabetical words', () => {
    for (let i = 0; i < alphabeticalTestNames.length; i++) {
      expect(getInitials(alphabeticalTestNames[i])).toBe(alphabeticalInitials[i]);
    }
  });

  it('return initials for words with titles', () => {
    for (let i = 0; i < namesWithTitles.length; i++) {
      expect(getInitials(namesWithTitles[i])).toBe(initialsForNameWithTitles[i]);
    }
  });

  it("returns initials when there's a coma", () => {
    expect(getInitials('Second, First')).toEqual('SF');
  });

  // Unit tests from Web
  it('handles null inputs', () => {
    expect(getInitials(null)).toEqual('');
    expect(getInitials(undefined)).toEqual('');
  });

  // it('calculates an expected initials in LTR for non-ASCII characters', () => {
  //   expect(getInitials('Írissa Þórðardóttir')).toEqual('ÍÞ');
  //   expect(getInitials('Øyvind Åsen')).toEqual('ØÅ');
  // });

  it('calculates an expected initials in LTR with a hypen', () => {
    expect(getInitials('David Zearing-Goff')).toEqual('DZ');
  });

  // it('calculates an expected initials in LTR with numbers', () => {
  //   expect(getInitials('4lex 5loo')).toEqual('45');
  // });
  it('calculates an expected initials in LTR with multiple parentheses, extra spaces, and unwanted characters', () => {
    const result = getInitials(' !@#$%^&*()=+ (Alpha) David   (The man) `~<>,./?[]{}|   Goff   (Gamma)    ');
    expect(result).toEqual('DG');
  });

  it('calculates an expected initials in LTR with multiple types of unwanted text', () => {
    const result = getInitials(' !@#$%^&*()=+ (Alpha) David   (The man) `~<>,./?[]{}|   Goff   (Gamma)  [Beta]  ');
    expect(result).toEqual('DG');
  });

  it('calculates an expected initials for Arabic names', () => {
    expect(getInitials('خسرو رحیمی')).toEqual('');
  });

  it('calculates an expected initials for Chinese names', () => {
    expect(getInitials('桂英')).toEqual('');
    expect(getInitials('佳')).toEqual('');
    expect(getInitials('宋智洋')).toEqual('');
  });

  it('calculates an expected initials for Korean names', () => {
    expect(getInitials('강현')).toEqual('');
    expect(getInitials('최종래')).toEqual('');
    expect(getInitials('남궁 성종')).toEqual('');
  });

  it('calculates an expected initials for Japanese names', () => {
    expect(getInitials('松田')).toEqual('');
    expect(getInitials('海野')).toEqual('');
    expect(getInitials('かり')).toEqual('');
  });

  // it('validates phone numbers', () => {
  // expect(getInitials('12345678')).toEqual('');
  // expect(getInitials('+1 (555) 123-4567 ext.4567')).toEqual('');
  // expect(getInitials('+47 12 34 56 78 (X 5678)')).toEqual('4');
  // expect(getInitials('47 12 34')).toEqual('');
  // expect(getInitials('47 12')).toEqual('');
  // expect(getInitials('1 Ext 2')).toEqual('');
  // result = getInitials('James Ext 2');
  // expect(result).toEqual('JE');
  // result = getInitials('1x1');
  // expect(result).toEqual('');
  // result = getInitials('1y1');
  // expect(result).toEqual('');
  // result = getInitials('1');
  // expect(result).toEqual('');
  // result = getInitials('A 2');
  // expect(result).toEqual('A');
  // });
});
