export async function scrambleInt(input, domain = '') {
  // DO NOT USE FOR SECURITY PURPOSES
  // turn a number into another number
  // change domain to change what number you get from a given number
  // returns a 32 bit unsigned integer
  const buffer = new TextEncoder().encode(input.toString().concat(';', domain));
  const hash = await crypto.subtle.digest('SHA-1', buffer);
  const result = new DataView(hash).getUint32(0, true);
  return result;
}
