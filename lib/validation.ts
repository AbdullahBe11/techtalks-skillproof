export function isSafeExternalUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}
