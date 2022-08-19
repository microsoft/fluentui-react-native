/**
 * A function which returns hash code for the avatar color. iOS implementation
 *
 * @param str is idForColor or name
 * @returns hash code of the color
 */
export const getHashCodeWeb = (str: string): number => {
  let hashCode = 0;
  for (let len: number = 0; len < str.length; len++) {
    const ch = str.charCodeAt(len);
    hashCode = 31 * hashCode + ch;
    if (hashCode < -2147483648 || hashCode > 2147483647) {
      hashCode = ~hashCode;
      hashCode = -1 * (hashCode + 1);
    }
  }
  return Math.abs(hashCode);
};
