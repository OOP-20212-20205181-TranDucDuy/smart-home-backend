export const USER_NOT_FOUND = 'User not found';
class Error {
  errorCode: number;
  message: string;
  constructor(errorCode: number, message: string) {
    this.errorCode = errorCode;
    this.message = message;
  }
}

export const EMAIL_ALREADY_USED = new Error(10001, 'Email already used');
export const WRONG_EMAIL_OR_PASSWORD = new Error(
  10002,
  'Wrong email or password',
);
export const UNVERIFIED_ACCOUNT = new Error(10003, 'Account not verified');
export const WRONG_VERIFICATION_LINK = new Error(
  10004,
  'Wrong verification link',
);