import { OWNER_EMAIL } from '../config/marketing'

export function buildPhotoUploadInstructions(
  orderNumber: string,
  groomName: string,
  brideName: string,
  contactEmail: string,
): string {
  const subject = `${orderNumber}_${groomName}_${brideName}`
  return `1. 「자료 폴더 받기」로 받은 ZIP을 풀어 주세요.
2. 01_포인트사진11장 · 02_흐름사진49장 · 03_기타자료 안에 사진·영상을 넣어 주세요.
3. 폴더 전체를 ZIP으로 압축해 아래로 보내 주세요.

보낼 곳: ${OWNER_EMAIL}
메일 제목: ${subject}
고객 이메일(참고): ${contactEmail}

가로 사진 권장 · 영상은 파일당 10초 이내
용량이 크면 구글 드라이브·네이버 MYBOX 링크를 메일 본문에 적어 주세요.`
}
