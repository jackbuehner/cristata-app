/**
 * Get whether the user's password is a tempoary password and whether it is expired.
 * @param flags - flag from db.user
 * @returns
 */
function getPasswordStatus(flags: string[]): { temporary: boolean; expired: boolean; expiresAt?: Date } {
  const tempPasswordFlag: string | undefined = flags.find((flag) => {
    if (flag.includes('TEMPORARY_PASSWORD')) return true;
    return false;
  });
  const expiresAt = (() => {
    if (tempPasswordFlag) {
      const [, , ms] = tempPasswordFlag.split('_'); // get the time the password expires
      return new Date(parseInt(ms));
    }
    return undefined;
  })();
  const isPasswordExpired = (() => {
    if (expiresAt) {
      // if the password expired before now, return true
      if (expiresAt <= new Date()) return true;
    }
    return false;
  })();
  return { temporary: !!tempPasswordFlag, expired: isPasswordExpired, expiresAt };
}
export { getPasswordStatus };
