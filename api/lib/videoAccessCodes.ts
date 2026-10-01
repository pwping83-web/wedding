export function normalizeVideoAccessCode(input: string): string {
  return input.replace(/\D/g, '').slice(-4)
}

export function isValidVideoAccessCode(
  input: string,
  env: Record<string, string | undefined> = {},
): boolean {
  const code = normalizeVideoAccessCode(input)
  if (code.length !== 4) return false
  const fromEnv = env.VIDEO_ACCESS_CODES?.split(',')
    .map((part) => part.trim())
    .filter(Boolean)
  const allowed = fromEnv?.length ? fromEnv : ['2673']
  return allowed.includes(code)
}
