import { decodePrintHtmlToken } from '../apiLib/printToken'

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
  <title>?�딩 ?�시???�쇄</title>
  ${PRINT_PAGE_STYLES}
</head>
<body>
  <div class="wcm-print-toolbar no-print">
    <button type="button" class="primary" onclick="window.print()">?�쇄 · PDF �??�??/button>
    <p style="margin:0;font-size:12px;color:#666;text-align:center;">?�쇄 ?�면?�서 ?�PDF�??�?��??�는 ?�파?�에 ?�?�」을 ?�택?�세??</p>
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

export async function handlePrintCueSheet(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return new Response('Method not allowed', { status: 405 })
  }

  const url = new URL(request.url)
  const token = url.searchParams.get('t')
  if (!token) {
    return new Response('?�쇄 링크가 ?�바르�? ?�습?�다.', { status: 400 })
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
    return new Response('?�쇄 링크가 만료?�었거나 ?�바르�? ?�습?�다.', { status: 400 })
  }
}
