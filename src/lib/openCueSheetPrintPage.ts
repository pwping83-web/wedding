import type { AppData } from '../data'
import { buildCueSheetPrintHtml } from './buildCueSheetDocumentHtml'

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

function buildPrintPageHtml(documentHtml: string): string {
  const autoPrint = !isMobileDevice()

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>웨딩 큐시트 · PDF 저장</title>
  <style>
    @page { size: A4 portrait; margin: 5mm 6mm; }
    html, body {
      margin: 0;
      padding: 0;
      background: #FFFFFF;
      color: #1A1A1A;
      font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', Arial, sans-serif;
    }
    .wcm-print-toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      background: #F5F5F5;
      border-bottom: 1px solid #E0E0E0;
    }
    .wcm-print-toolbar button {
      border: none;
      border-radius: 10px;
      padding: 12px 20px;
      width: min(100%, 360px);
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      font-family: inherit;
      background: #173F9F;
      color: #FFFFFF;
    }
    .wcm-print-toolbar p {
      margin: 0;
      max-width: 360px;
      font-size: 12px;
      line-height: 1.5;
      color: #666;
      text-align: center;
    }
    @media print {
      .wcm-print-toolbar { display: none !important; }
      * {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }
  </style>
</head>
<body>
  <div class="wcm-print-toolbar no-print">
    <button type="button" onclick="window.print()">인쇄 · PDF 로 저장</button>
    <p>인쇄 화면에서 「PDF로 저장」 또는 「파일에 저장」을 선택하세요.</p>
  </div>
  ${documentHtml}
  <script>
    window.addEventListener('load', function () {
      ${autoPrint ? "setTimeout(function () { window.print(); }, 350);" : ''}
    });
  </script>
</body>
</html>`
}

export function openCueSheetPrintPage(data: AppData): void {
  const documentHtml = buildCueSheetPrintHtml(data)
  const html = buildPrintPageHtml(documentHtml)
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const popup = window.open(url, '_blank', 'noopener,noreferrer')
  if (popup) {
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    return
  }

  window.location.assign(url)
}
