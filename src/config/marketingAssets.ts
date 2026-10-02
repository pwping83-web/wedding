import { MC_LOGO_DATA_URL } from '../assets/branding/mcLogoData.ts'
import sampleThumbUrl from '../assets/branding/sample-thumb.jpg'
import { publicAssetUrl } from '../lib/publicAssetUrl'

/** Git LFS 없이 Vercel/GitHub Pages에서도 표시 (mcLogoData.ts) */
export const mcLogoUrl = MC_LOGO_DATA_URL
export const mcLogoFallbackUrl = publicAssetUrl('mc-logo.png')

export { sampleThumbUrl }
