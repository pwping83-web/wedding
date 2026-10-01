import JSZip from 'jszip'
import { OWNER_EMAIL } from '../config/marketing'
import { POINT_SLOT_HINTS } from '../constants/videoMaterialFolder'

function sanitizeFilePart(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '_').trim() || '고객'
}

export async function downloadVideoMaterialZip(options: {
  groomName: string
  brideName: string
  contactEmail: string
  orderNumber: string
}): Promise<void> {
  const groom = sanitizeFilePart(options.groomName)
  const bride = sanitizeFilePart(options.brideName)
  const rootName = `${options.orderNumber}_${groom}_${bride}`
  const zip = new JSZip()
  const root = zip.folder(rootName)
  if (!root) throw new Error('ZIP 생성에 실패했습니다.')

  const pointFolder = root.folder('01_포인트사진11장')
  if (pointFolder) {
    for (let i = 1; i <= 11; i += 1) {
      const id = `P${String(i).padStart(2, '0')}`
      const hint = POINT_SLOT_HINTS[id] ?? '사진 또는 영상 (10초 이내)'
      pointFolder.file(
        `${id}_여기에_파일넣기.txt`,
        `${id}\n${hint}\n\n파일명 예: ${id}.jpg 또는 ${id}.mp4`,
      )
    }
  }

  const flowFolder = root.folder('02_흐름사진49장')
  if (flowFolder) {
    flowFolder.file(
      'README.txt',
      'F01부터 시간 순서대로 사진·영상을 넣어 주세요.\n파일명 예: F01.jpg, F02.jpg … F49.jpg\n49장보다 적으면 앞 번호부터 사용합니다.',
    )
    for (let i = 1; i <= 49; i += 1) {
      const id = `F${String(i).padStart(2, '0')}`
      flowFolder.file(`${id}_여기에_파일넣기.txt`, `${id} — 지나가는 장면`)
    }
  }

  root.folder('03_기타자료')?.file(
    'README.txt',
    '추가로 보내실 자료가 있으면 이 폴더에 넣어 주세요.',
  )

  root.file(
    '메모.txt',
    [
      '식전영상 사진·영상 보내는 방법',
      '',
      `수신 이메일: ${OWNER_EMAIL}`,
      `고객 이메일: ${options.contactEmail}`,
      `메일 제목: ${rootName}`,
      '',
      '1. 01_포인트사진11장 — P01~P11 (화면에 길게 멈추는 11장)',
      '2. 02_흐름사진49장 — F01~F49 (시간 순서)',
      '3. 03_기타자료 — 필요 시',
      '',
      '가로 사진 권장 · 영상은 파일당 10초 이내',
      '용량이 크면 ZIP으로 압축하거나 구글 드라이브·MYBOX 링크를 메일에 적어 주세요.',
      '',
      '※ 글귀는 웹에서 「글귀 저장」을 눌러 주셨다면 따로 보내지 않아도 됩니다.',
    ].join('\n'),
  )

  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${rootName}_식전영상자료.zip`
  anchor.click()
  URL.revokeObjectURL(url)
}
