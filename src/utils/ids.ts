import { customAlphabet } from 'nanoid';
export const createPassword = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    6,
  );
  export const createOTP = customAlphabet(
    '0123456789',
    6,
  );