const verificationCodes = new Map();


export function saveVerificationCode(
  phoneNumber,
  code
) {
  verificationCodes.set(
    phoneNumber,
    {
      code,

      expiresAt:
        Date.now() + 5 * 60 * 1000
    }
  );
}


export function getVerificationCode(
  phoneNumber
) {
  return verificationCodes.get(
    phoneNumber
  );
}


export function removeVerificationCode(
  phoneNumber
) {
  verificationCodes.delete(
    phoneNumber
  );
}