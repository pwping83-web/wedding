import type { AppData } from '../data'
import { buildCueSheetShareText } from './buildCueSheetShareText'

export async function shareCueSheetToKakao(data: AppData): Promise<'shared' | 'copied'> {
  const title = '예식 큐시트'
  const text = buildCueSheetShareText(data)

  if (typeof navigator.share === 'function') {
    await navigator.share({ title, text })
    return 'shared'
  }

  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return 'copied'
  }

  throw new Error('이 기기에서는 카톡 공유를 지원하지 않습니다.')
}
