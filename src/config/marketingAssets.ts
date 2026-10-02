import mcLogoBundled from '../assets/branding/mc-logo.png?inline'
import sampleThumbUrl from '../assets/branding/sample-thumb.jpg'
import { publicAssetUrl } from '../lib/publicAssetUrl'

/**
 * data: URL — Figma Make / 서브경로 배포에서도 img src 404 없이 표시
 * (실패 시 public mc-logo.png)
 */
export const mcLogoUrl = mcLogoBundled
export const mcLogoFallbackUrl = publicAssetUrl('mc-logo.png')

export { sampleThumbUrl }
