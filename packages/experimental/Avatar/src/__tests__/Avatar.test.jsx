import * as React from 'react';

import * as renderer from 'react-test-renderer';

import { Avatar } from '..';
import { getInitials } from '../useAvatar';

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
const namesWithTitles = ['Mr Feynman', 'Dr Richard Feynman'];
const initialsForNameWithTitles = ['F', 'RF'];

describe('Avatar rendering', () => {
  it('renders Avatar', () => {
    const tree = renderer.create(<Avatar />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('getInitials - names with titles', () => {
  it('returns initials without title', () => {
    expect(getInitials('Mr Faynman')).toBe('F');
  });
  it('returns initials for names with multi-word titles', () => {
    expect(getInitials('Consul General Richard Faynman')).toBe('RF');
    expect(getInitials('Major General Victor')).toBe('V');
  });
});

describe('getInitials method - language support', () => {
  it('returns correct initials cyrillic language', () => {
    const test = getInitials('Илон Маск');
    expect(test).toBe('ИМ');
  });
  it('calculates correct initials for non-ASCII characters', () => {
    const test = getInitials('Írissa Þórðardóttir');
    expect(test).toBe('ÍÞ');
  });
  it('returns correct initials for non-ASCII characters', () => {
    const test = getInitials('Øyvind Åsen');
    expect(test).toBe('ØÅ');
  });
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
  it('calculates an expected initials in LTR with a hypen', () => {
    expect(getInitials('David Zearing-Goff')).toEqual('DZ');
  });
  it('calculates an expected initials in LTR with numbers', () => {
    expect(getInitials('4lex 5loo')).toEqual('LL');
  });
  it('calculates an expected initials in LTR with multiple parentheses, extra spaces, and unwanted characters', () => {
    const result = getInitials(' !@#$%^&*()=+ (Alpha) David   (The man) `~<>,./?[]{}|   Goff   (Gamma)    ');
    expect(result).toEqual('DG');
  });
  it('calculates an expected initials in LTR with multiple types of unwanted text', () => {
    const result = getInitials(" !@#$%^&*()=+ (Alpha) /David   (The man) `~<>,./?[]{}|   'Goff   (Gamma)  [Beta]  ");
    expect(result).toEqual('DG');
  });
  it('calculates an expected initials for Arabic names', () => {
    expect(getInitials('خسرو رحیمی')).toEqual('خ');
  });
  it('calculates an expected initials for Chinese names', () => {
    expect(getInitials('桂英')).toEqual('桂');
    expect(getInitials('佳')).toEqual('佳');
    expect(getInitials('宋智洋')).toEqual('宋');
  });
  it('calculates an expected initials for Korean names', () => {
    expect(getInitials('강현')).toEqual('강');
    expect(getInitials('최종래')).toEqual('최');
    expect(getInitials('남궁 성종')).toEqual('남');
  });
  it('calculates an expected initials for Japanese names', () => {
    expect(getInitials('松田')).toEqual('松');
    expect(getInitials('海野')).toEqual('海');
    expect(getInitials('かり')).toEqual('か');
  });
  it('validates phone numbers', () => {
    expect(getInitials('12345678')).toEqual('');
    // expect(getInitials('+1 (555) 123-4567 ext.4567')).toEqual('');
    expect(getInitials('+47 12 34 56 78 (X 5678)')).toEqual('');
    expect(getInitials('47 12 34')).toEqual('');
    expect(getInitials('47 12')).toEqual('');

    expect(getInitials('James Ext 2')).toEqual('JE');
    // expect(getInitials('1 Ext 2')).toEqual('');
    // expect(getInitials('1x1')).toEqual('');
    result = getInitials('1');
    expect(result).toEqual('');
    result = getInitials('A 2');
    expect(result).toEqual('A');
  });
});
