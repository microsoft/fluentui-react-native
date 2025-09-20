import * as renderer from 'react-test-renderer';

import { Avatar } from '..';
import { getInitials, resolveColorfulToSpecificColor } from '../useAvatar';

const emptyData = [
  [undefined, ''],
  [null, ''],
  ['', ''],
];

const testData = [
  ['Marie', 'M'],
  ['Aadi KaPoor', 'AK'],
  ['Marie Beaudouin', 'MB'],
  ['Aadi Meni KaPoor', 'AK'],
  ['Will Little (Teams)', 'WL'],
  ['Will Little-Tanaka', 'WL'],
  ['-Aadi Kapoor', 'AK'],
  ['Richard 23 Feynman', 'RF'],
  ['* Richard *', 'R'],
  ['Richard Feynman [Teams],', 'RF'],
  ['Richard Feynman {Teams}', 'RF'],
  ['-Test   str  with *spaces', 'TS'],
  ['Second, First', 'SF'],
];

const namesWithTitles = [
  ['Mr Feynman', 'F'],
  ['Dr Richard Feynman', 'RF'],
  ['Aadi Meni Ka Jr', 'AK'],
  ['Consul General Richard Faynman', 'RF'],
  ['Major General Victor', 'V'],
];

const languageTestData = [
  ['خسرو رحیمی', 'خ'], // Arabic
  ['桂英', '桂'], // Chinese
  ['佳', '佳'],
  ['宋智洋', '宋'],
  ['강현', '강'], // Korean
  ['최종래', '최'],
  ['남궁 성종', '남'],
  ['松田', '松'], // Japanese
  ['海野', '海'],
  ['かり', 'か'],
  ['Илон Маск', 'ИМ'], // Cyrillic
  ['Írissa Þórðardóttir', 'ÍÞ'], // non-ASCII characters
  ['Øyvind Åsen', 'ØÅ'],
  ['ثابت بن قره', 'ث'], // Thābit ibn Qurra - result in PCX - ثابت
  ['שירה לוי', 'של'], // Hebrew - Shira Levi
];

const phoneNumbersAndDigits = [
  ['12345678', ''],
  ['+47 12 34 56 78 (X 5678)', ''],
  ['47 12 34', ''],
  ['47 12', ''],
  ['James Ext 2', 'JE'],
  ['1', ''],
  ['A2', 'A'],
];

const multiWordTitlesData = [
  ['Air Comm', ''],
  ['Brig & Mrs', ''],
  ['Brig Gen', ''],
  ['Commander & Mrs', ''],
  ['Consul General', ''],
  ['Dr & Mrs', ''],
  ['Lord & Lady', ''],
  ['Major General', ''],
  ['Mr & Dr', ''],
  ['Mr & Mrs', ''],
  ['Mr & Ms', ''],
  ['Prof & Dr', ''],
  ['Prof & Mrs', ''],
  ['Rev & Mrs', ''],
  ['Rev Canon', ''],
  ['Rev Dr', ''],
  ['Sir & Lady', ''],
  ['The Rt Hon Lord Victor', 'V'],
];

const edgeCaseData = [
  ['4lex 5loo', 'LL'],
  [' !@#$%^&*()=+ (Alpha) David   (The man) `~<>,./?[]{}|   Goff   (Gamma)    ', 'DG'],
  ['+1 (555) 123-4567 ext.4567', 'E'],
  ['1 Ext 2', 'E'],
  ['1x1', 'X'],
];

describe('getInitials method', () => {
  it.each(emptyData)("returns an empty string for '%s'", (text, expected) => {
    expect(getInitials(text)).toBe(expected);
  });
  it.each(testData)("render correct initials for input '%s'", (text, expected) => {
    expect(getInitials(text)).toBe(expected);
  });
  it.each(namesWithTitles)("render initials for names with titles: '%s'", (text, expected) => {
    expect(getInitials(text)).toBe(expected);
  });
  it.each(languageTestData)("render initials for different languages: '%s'", (text, expected) => {
    expect(getInitials(text)).toBe(expected);
  });
  it.each(phoneNumbersAndDigits)("returns an empty string for phone numbers: '%s'", (text, expected) => {
    expect(getInitials(text)).toBe(expected);
  });
  it.each(edgeCaseData)("render initials for edge cases: '%s'", (text, expected) => {
    expect(getInitials(text)).toBe(expected);
  });
  it.each(multiWordTitlesData)("render initials for multi-word titles: '%s'", (text, expected) => {
    expect(getInitials(text)).toBe(expected);
  });
});

describe('resolveColorfulToSpecificColor method', () => {
  it('Name = Satya Nadella', () => {
    expect(resolveColorfulToSpecificColor(undefined, 'Satya Nadella')).toBe('lilac');
  });
  it('Name = Bill Gates', () => {
    expect(resolveColorfulToSpecificColor(undefined, 'Bill Gates')).toBe('plum');
  });
  it('Undefined case', () => {
    expect(resolveColorfulToSpecificColor(undefined, undefined)).toBe('darkRed');
  });
  it('Id = a', () => {
    expect(resolveColorfulToSpecificColor('a', undefined)).toBe('brass');
  });
  it('Id = x', () => {
    expect(resolveColorfulToSpecificColor('x', undefined)).toBe('darkRed');
  });
});

describe('Avatar component tests', () => {
  it('Avatar default', () => {
    const tree = renderer.create(<Avatar />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Avatar circular', () => {
    const tree = renderer.create(<Avatar shape="circular" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Avatar square', () => {
    const tree = renderer.create(<Avatar shape="square" />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Avatar badge', () => {
    const tree = renderer.create(<Avatar badge={{ status: 'available', outOfOffice: false }} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('Avatar ring', () => {
    const tree = renderer.create(<Avatar active="active" activeAppearance="ring" />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
