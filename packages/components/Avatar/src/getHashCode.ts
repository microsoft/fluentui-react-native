/**
 * A function which returns hash code for the avatar color. Web implementation
 *
 * @param str is idForColor or name
 * @returns hash code of the color
 */
export const getHashCodeWeb = (str: string): number => {
  let hashCode = 0;
  for (let len: number = str.length - 1; len >= 0; len--) {
    const ch = str.charCodeAt(len);
    const shift = len % 8;
    hashCode ^= (ch << shift) + (ch >> (8 - shift));
  }

  return hashCode;
};
