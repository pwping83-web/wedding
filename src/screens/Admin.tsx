import { useCallback, useEffect, useState } from 'react'
import Btn from '../components/mobile/Btn'
import {
  adminLogin,
  clearAdminToken,
  deleteDelivery,
  fetchDeliveries,
  fetchDelivery,
  fetchVideoText,
  fetchVideoTexts,
  getAdminToken,
  openDeliveryHtmlWindow,
  updateDeliveryPrintHtml,
  type DeliveryDetail,
  type DeliverySummary,
  type VideoTextDetail,
  type VideoTextSummary,
} from '../lib/adminApi'
import AdminDeliveryModal from '../components/AdminDeliveryModal'
import AdminVideoTextDetailModal from '../components/AdminVideoTextDetailModal'

interface Props {
  onBack: () => void
}

function formatSentAt(value: string): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleString('ko-KR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatWeddingDate(value: string): string {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  })
}

export default function Admin({ onBack }: Props) {
  const [authenticated, setAuthenticated] = useState(Boolean(getAdminToken()))
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  const [deliveries, setDeliveries] = useState<DeliverySummary[]>([])
  const [archiveConfigured, setArchiveConfigured] = useState(true)
  const [loadingList, setLoadingList] = useState(false)
  const [listError, setListError] = useState('')
  const [loadingDeliveryId, setLoadingDeliveryId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deliveryModal, setDeliveryModal] = useState<{
    mode: 'view' | 'edit'
    delivery: DeliveryDetail
  } | null>(null)
  const [savingDelivery, setSavingDelivery] = useState(false)

  const [section, setSection] = useState<'deliveries' | 'video-text'>('deliveries')
  const [videoTexts, setVideoTexts] = useState<VideoTextSummary[]>([])
  const [videoArchiveConfigured, setVideoArchiveConfigured] = useState(true)
  const [loadingVideoTexts, setLoadingVideoTexts] = useState(false)
  const [openingVideoId, setOpeningVideoId] = useState<string | null>(null)
  const [selectedVideoText, setSelectedVideoText] = useState<VideoTextDetail | null>(null)

  const loadDeliveries = useCallback(async () => {
    setLoadingList(true)
    setListError('')
    try {
      const result = await fetchDeliveries()
      setDeliveries(result.deliveries)
      setArchiveConfigured(result.archiveConfigured)
    } catch (error) {
      if (error instanceof Error && error.message.includes('로그인')) {
        clearAdminToken()
        setAuthenticated(false)
      }
      setListError(error instanceof Error ? error.message : '목록을 불러오지 못했습니다.')
    } finally {
      setLoadingList(false)
    }
  }, [])

  const loadVideoTexts = useCallback(async () => {
    setLoadingVideoTexts(true)
    setListError('')
    try {
      const result = await fetchVideoTexts()
      setVideoTexts(result.items)
      setVideoArchiveConfigured(result.archiveConfigured)
    } catch (error) {
      if (error instanceof Error && error.message.includes('로그인')) {
        clearAdminToken()
        setAuthenticated(false)
      }
      setListError(error instanceof Error ? error.message : '글귀 목록을 불러오지 못했습니다.')
    } finally {
      setLoadingVideoTexts(false)
    }
  }, [])

  useEffect(() => {
    if (authenticated) {
      void loadDeliveries()
      void loadVideoTexts()
    }
  }, [authenticated, loadDeliveries, loadVideoTexts])

  const handleLogin = async () => {
    setLoggingIn(true)
    setLoginError('')
    try {
      await adminLogin(password)
      setPassword('')
      setAuthenticated(true)
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : '로그인에 실패했습니다.')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    clearAdminToken()
    setAuthenticated(false)
    setDeliveries([])
  }

  const runDeliveryAction = async (id: string, action: 'view' | 'print' | 'edit') => {
    setLoadingDeliveryId(id)
    setListError('')
    try {
      const delivery = await fetchDelivery(id)
      if (action === 'print') {
        openDeliveryHtmlWindow(delivery.printHtml, { printOnLoad: true })
        return
      }
      setDeliveryModal({ mode: action, delivery })
    } catch (error) {
      setListError(error instanceof Error ? error.message : '큐시트를 불러오지 못했습니다.')
    } finally {
      setLoadingDeliveryId(null)
    }
  }

  const handleSaveDeliveryEdit = async (printHtml: string) => {
    if (!deliveryModal) return
    setSavingDelivery(true)
    setListError('')
    try {
      await updateDeliveryPrintHtml(deliveryModal.delivery.id, printHtml)
      setDeliveryModal(null)
    } catch (error) {
      setListError(error instanceof Error ? error.message : '큐시트를 저장하지 못했습니다.')
    } finally {
      setSavingDelivery(false)
    }
  }

  const handleOpenVideoText = async (id: string) => {
    setOpeningVideoId(id)
    setListError('')
    try {
      const item = await fetchVideoText(id)
      setSelectedVideoText(item)
    } catch (error) {
      setListError(error instanceof Error ? error.message : '글귀를 불러지 못했습니다.')
    } finally {
      setOpeningVideoId(null)
    }
  }

  const handleDeleteDelivery = async (delivery: DeliverySummary) => {
    const label = `${delivery.groomName || '신랑'} · ${delivery.brideName || '신부'}`
    const confirmed = window.confirm(`「${label}」 전송 기록을 삭제할까요?\n삭제 후에는 복구할 수 없습니다.`)
    if (!confirmed) return

    setDeletingId(delivery.id)
    setListError('')
    try {
      await deleteDelivery(delivery.id)
      setDeliveries((prev) => prev.filter((item) => item.id !== delivery.id))
    } catch (error) {
      setListError(error instanceof Error ? error.message : '기록을 삭제하지 못했습니다.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="min-h-[100dvh] bg-bg px-5 py-8">
        <button
          type="button"
          onClick={onBack}
          className="text-[14px] text-muted-text mb-8"
        >
          ← 돌아가기
        </button>

        <h1 className="text-[22px] font-semibold text-charcoal mb-2">관리자</h1>
        <p className="text-[14px] text-muted-text mb-6">사회자 전송 기록을 확인합니다.</p>

        <label className="block mb-2 text-[13px] font-medium text-charcoal">비밀번호</label>
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') void handleLogin()
          }}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-[15px] mb-4"
          autoComplete="current-password"
        />

        {loginError && <p className="text-[13px] text-danger mb-4">{loginError}</p>}

        <Btn onClick={() => void handleLogin()} disabled={loggingIn || !password.trim()}>
          {loggingIn ? '확인 중…' : '입장'}
        </Btn>
      </div>
    )
  }

  return (
    <div className="min-h-[100dvh] bg-bg px-5 py-8 pb-24">
      <div className="flex items-start justify-between gap-3 mb-6">
        <div>
          <button type="button" onClick={onBack} className="text-[14px] text-muted-text mb-3 block">
            ← 돌아가기
          </button>
          <h1 className="text-[22px] font-semibold text-charcoal">관리자</h1>
          <p className="text-[13px] text-muted-text mt-1">큐시트 · 식전영상 글귀</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-[13px] text-muted-text underline shrink-0 mt-8"
        >
          로그아웃
        </button>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setSection('deliveries')}
          className={`flex-1 h-10 rounded-xl text-[14px] font-medium ${section === 'deliveries' ? 'bg-charcoal text-white' : 'bg-white border border-border text-charcoal'}`}
        >
          큐시트
        </button>
        <button
          type="button"
          onClick={() => setSection('video-text')}
          className={`flex-1 h-10 rounded-xl text-[14px] font-medium ${section === 'video-text' ? 'bg-charcoal text-white' : 'bg-white border border-border text-charcoal'}`}
        >
          식전영상 글귀
        </button>
      </div>

      {section === 'deliveries' && !archiveConfigured && (
        <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          Supabase 저장 설정이 없습니다. Vercel 환경 변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)와
          테이블 생성이 필요합니다.
        </p>
      )}

      {section === 'video-text' && !videoArchiveConfigured && (
        <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          video_text_submissions 테이블이 필요합니다. supabase/video_text_submissions.sql을 실행해
          주세요.
        </p>
      )}

      {listError && <p className="text-[13px] text-danger mb-4">{listError}</p>}

      {section === 'deliveries' &&
        (loadingList ? (
          <p className="text-[14px] text-muted-text">불러오는 중…</p>
        ) : deliveries.length === 0 ? (
          <p className="text-[14px] text-muted-text">아직 전송된 큐시트가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {deliveries.map((delivery) => (
              <li
                key={delivery.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <p className="text-[15px] font-semibold text-charcoal mb-1">
                  {delivery.groomName || '신랑'} · {delivery.brideName || '신부'}
                </p>
                <p className="text-[13px] text-muted-text mb-1">
                  {formatWeddingDate(delivery.weddingDate)}
                  {delivery.weddingTime ? ` ${delivery.weddingTime}` : ''}
                </p>
                {delivery.venue && (
                  <p className="text-[13px] text-muted-text mb-2">{delivery.venue}</p>
                )}
                <p className="text-[12px] text-muted-text mb-3">
                  전송 {formatSentAt(delivery.createdAt)} · {delivery.mcEmail}
                </p>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Btn
                    variant="secondary"
                    full={false}
                    className="!text-[13px] !h-11 !px-2"
                    onClick={() => void runDeliveryAction(delivery.id, 'view')}
                    disabled={loadingDeliveryId === delivery.id || deletingId === delivery.id}
                  >
                    {loadingDeliveryId === delivery.id ? '…' : '보기'}
                  </Btn>
                  <Btn
                    variant="secondary"
                    full={false}
                    className="!text-[13px] !h-11 !px-2"
                    onClick={() => void runDeliveryAction(delivery.id, 'print')}
                    disabled={loadingDeliveryId === delivery.id || deletingId === delivery.id}
                  >
                    인쇄
                  </Btn>
                  <Btn
                    variant="secondary"
                    full={false}
                    className="!text-[13px] !h-11 !px-2"
                    onClick={() => void runDeliveryAction(delivery.id, 'edit')}
                    disabled={loadingDeliveryId === delivery.id || deletingId === delivery.id}
                  >
                    수정하기
                  </Btn>
                </div>
                <Btn
                  variant="danger"
                  onClick={() => void handleDeleteDelivery(delivery)}
                  disabled={loadingDeliveryId === delivery.id || deletingId === delivery.id}
                >
                  {deletingId === delivery.id ? '삭제 중…' : '삭제'}
                </Btn>
              </li>
            ))}
          </ul>
        ))}

      {section === 'video-text' &&
        (loadingVideoTexts ? (
          <p className="text-[14px] text-muted-text">불러오는 중…</p>
        ) : videoTexts.length === 0 ? (
          <p className="text-[14px] text-muted-text">저장된 식전영상 글귀가 없습니다.</p>
        ) : (
          <ul className="space-y-3">
            {videoTexts.map((item) => (
              <li
                key={item.id}
                className="rounded-2xl border border-border bg-white p-4 shadow-sm"
              >
                <p className="text-[15px] font-semibold text-charcoal mb-1">
                  {item.groomName || '신랑'} · {item.brideName || '신부'}
                </p>
                <p className="text-[13px] text-muted-text mb-1">{item.contactEmail}</p>
                <p className="text-[12px] text-muted-text mb-3">저장 {formatSentAt(item.createdAt)}</p>
                <Btn
                  variant="secondary"
                  onClick={() => void handleOpenVideoText(item.id)}
                  disabled={openingVideoId === item.id}
                >
                  {openingVideoId === item.id ? '불러오는 중…' : '보기'}
                </Btn>
              </li>
            ))}
          </ul>
        ))}

      <AdminDeliveryModal
        mode={deliveryModal?.mode ?? null}
        delivery={deliveryModal?.delivery ?? null}
        saving={savingDelivery}
        onClose={() => setDeliveryModal(null)}
        onSave={handleSaveDeliveryEdit}
      />

      <AdminVideoTextDetailModal
        item={selectedVideoText}
        onClose={() => setSelectedVideoText(null)}
      />
    </div>
  )
}
