import { OWNER_EMAIL } from '../config/marketing'

export function buildPhotoUploadInstructions(groomName: string, brideName: string): string {
  const subject = `${groomName}_${brideName}`
  return `아래 이메일로 사진을 보내주세요: ${OWNER_EMAIL}
메일 제목: ${subject}
폴더 구성에 맞게 전송해 주세요.`
}
