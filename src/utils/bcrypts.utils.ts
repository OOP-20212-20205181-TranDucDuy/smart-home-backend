import { hash, compare } from "bcrypt";

const ROUNDS = 10;

// export const hashPassword = (password: string): Promise<string> => {
//     return hash(password, ROUNDS);
// }

// export const verifyPassword = (passwordToVerify: string, hash: string): Promise<boolean> => {
//     return compare(passwordToVerify, hash);
// }