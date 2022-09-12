/**
 * A java string hash algorithm for determining the avatar color,
 * implemented in JS and used by FluentUI Apple and FluentUI Android.
 *
 * Must use 32-bit integers as JVM specification is 32-bits for ints
 *
 * @param str is idForColor or name
 * @returns hash code of the color
 */
export const getJavaHashCode = (str: string): number => {
  let hashCode = 0;
  for (let len: number = 0; len < str.length; len++) {
    hashCode = 31 * hashCode + str.charCodeAt(len);
    hashCode = hashCode & hashCode; // converts hashCode to 32-bit integer
  }
  return Math.abs(hashCode);
};
