function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/** 이메일 본문 상단 인쇄 버튼 (JS 불가 → 링크로 브라우저 인쇄 페이지 열기) */
export function renderEmailPrintButton(printUrl: string): string {
  if (!printUrl.trim()) {
    return ''
  }

  const href = escapeHtml(printUrl)

  return `
<table class="wcm-email-print-btn" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 14px;border-collapse:collapse;">
  <tr>
    <td align="center" style="padding:0;">
      <a href="${href}" target="_blank" rel="noopener noreferrer"
         style="display:inline-block;background:#173F9F;color:#FFFFFF;text-decoration:none;font-family:'Apple SD Gothic Neo','Malgun Gothic',Arial,sans-serif;font-size:15px;font-weight:700;line-height:1;padding:12px 28px;border-radius:8px;">
        인쇄
      </a>
    </td>
  </tr>
</table>`.trim()
}

export function injectEmailPrintButton(cueSheetHtml: string, printUrl: string): string {
  const button = renderEmailPrintButton(printUrl)
  if (!button) return cueSheetHtml

  const styleEnd = cueSheetHtml.indexOf('</style>')
  if (styleEnd !== -1) {
    return `${cueSheetHtml.slice(0, styleEnd + 8)}\n${button}\n${cueSheetHtml.slice(styleEnd + 8)}`
  }

  return `${button}\n${cueSheetHtml}`
}
