// Shared password rules — same as the checks in POST /api/register:
// at least 8 characters, with both letters and numbers.
// Returns an error message, or null when the password is acceptable.
export function validatePassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length < 8) {
    return "Password must be at least 8 characters."
  }
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return "Password must contain both letters and numbers."
  }
  return null
}
