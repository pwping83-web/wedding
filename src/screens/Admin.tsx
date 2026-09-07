import { useCallback, useEffect, useState } from 'react'
import Btn from '../components/mobile/Btn'
import {
  adminLogin,
  clearAdminToken,
  fetchDeliveries,
  fetchDelivery,
  getAdminToken,
  openDeliveryPrintWindow,
  type DeliverySummary,
} from '../lib/adminApi'

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
  const [openingId, setOpeningId] = useState<string | null>(null)

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

  useEffect(() => {
    if (authenticated) {
      void loadDeliveries()
    }
  }, [authenticated, loadDeliveries])

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

  const handleOpenDelivery = async (id: string) => {
    setOpeningId(id)
    try {
      const delivery = await fetchDelivery(id)
      openDeliveryPrintWindow(delivery.printHtml)
    } catch (error) {
      setListError(error instanceof Error ? error.message : '큐시트를 열지 못했습니다.')
    } finally {
      setOpeningId(null)
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
          <h1 className="text-[22px] font-semibold text-charcoal">전송 기록</h1>
          <p className="text-[13px] text-muted-text mt-1">사회자에게 보낸 큐시트</p>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="text-[13px] text-muted-text underline shrink-0 mt-8"
        >
          로그아웃
        </button>
      </div>

      {!archiveConfigured && (
        <p className="text-[13px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
          Supabase 저장 설정이 없습니다. Vercel 환경 변수(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)와
          테이블 생성이 필요합니다.
        </p>
      )}

      {listError && <p className="text-[13px] text-danger mb-4">{listError}</p>}

      {loadingList ? (
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
              <Btn
                variant="secondary"
                onClick={() => void handleOpenDelivery(delivery.id)}
                disabled={openingId === delivery.id}
              >
                {openingId === delivery.id ? '여는 중…' : '보기 · 인쇄'}
              </Btn>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
