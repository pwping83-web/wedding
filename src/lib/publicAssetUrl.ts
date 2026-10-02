/** public/ 또는 `/foo.jpg` 형태 경로를 Vite base에 맞게 변환 */
export function publicAssetUrl(path: string): string {
  const trimmed = path.trim()
  if (!trimmed) return ''
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  const base = import.meta.env.BASE_URL
  return `${base}${trimmed.replace(/^\//, '')}`
}
