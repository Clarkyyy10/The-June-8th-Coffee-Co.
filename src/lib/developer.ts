// Developer (super-admin) gate used to approve account requests.
// The developer proves identity with DEVELOPER_KEY; on success an httpOnly
// cookie is set and checked on every developer-only API call.

export const DEV_COOKIE = "j9_dev";

/** The configured developer key (server-side only). */
export function developerKey(): string | undefined {
  return process.env.DEVELOPER_KEY;
}

/** Constant-time-ish comparison of the provided value against the dev key. */
export function isValidDeveloperKey(value: string | undefined): boolean {
  const key = developerKey();
  if (!key || !value) return false;
  if (value.length !== key.length) return false;
  let diff = 0;
  for (let i = 0; i < key.length; i++) {
    diff |= key.charCodeAt(i) ^ value.charCodeAt(i);
  }
  return diff === 0;
}
