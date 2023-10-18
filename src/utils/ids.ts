import { customAlphabet } from 'nanoid';
export const createPassword = customAlphabet(
    '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    6,
  );