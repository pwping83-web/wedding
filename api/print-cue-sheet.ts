export const config = {
  runtime: 'edge',
}

import { decodePrintHtmlToken } from './lib/printToken'

const PRINT_PAGE_STYLES = `
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
    justify-content: center;
    gap: 10px;
    padding: 12px;
    background: #F5F5F5;
    border-bottom: 1px solid #E0E0E0;
  }
  .wcm-print-toolbar button {
    border: none;
    border-radius: 8px;
    padding: 10px 20px;
    font-size: 15px;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
  }
  .wcm-print-toolbar .primary {
    background: #173F9F;
    color: #FFFFFF;
  }
  @media print {
    .wcm-print-toolbar { display: none !important; }
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
</style>`.trim()

function renderPrintPage(documentHtml: string): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>웨딩 큐시트 인쇄</title>
  ${PRINT_PAGE_STYLES}
</head>
<body>
  <div class="wcm-print-toolbar no-print">
    <button type="button" class="primary" onclick="window.print()">인쇄</button>
  </div>
  ${documentHtml}
  <script>
    window.addEventListener('load', function () {
      setTimeout(function () { window.print(); }, 350);
    });
  </script>
</body>
</html>`
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(request.url)
  const token = url.searchParams.get('t')
  if (!token) {
    return new Response('인쇄 링크가 올바르지 않습니다.', { status: 400 })
  }

  try {
    const documentHtml = await decodePrintHtmlToken(token)
    return new Response(renderPrintPage(documentHtml), {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    })
  } catch {
    return new Response('인쇄 링크가 만료되었거나 올바르지 않습니다.', { status: 400 })
  }
}
