import { OWNER_EMAIL } from '../config/marketing'

/** /video 제출 완료 화면 안내 (주문번호·이름은 런타임 치환) */
export function buildPhotoUploadInstructions(
  orderNumber: string,
  groomName: string,
  brideName: string,
): string {
  const subject = `${orderNumber}_${groomName}_${brideName}`
  return `아래 이메일로 사진을 보내주세요: ${OWNER_EMAIL}
메일 제목: ${subject}
폴더 구성:
01_포인트 폴더 — P01~P11 (화면에 길게 멈추는 장면 11장, 사진 또는 영상)
 · P01 두 사람이 함께 나온 대표 사진 (이름이 들어가요)
 · P07 (3초) / P11 (마지막 4초) 가장 좋아하는 사진
 · P03 / P07 / P08 은 큰 글자가 덮으니 얼굴이 작게 나온 사진 추천
02_흐름 폴더 — F01~F49 (지나가는 사진, 시간 순서대로 번호만)
 · 49장보다 적으면 앞에서부터 반복해서 채워집니다
가로 사진 권장, 영상은 파일당 10초 이내
용량이 크면 ZIP으로 압축 후 대용량 첨부 또는 구글 드라이브·네이버 MYBOX 링크로 보내주세요.`
}
