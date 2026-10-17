import MobileShell from './components/mobile/MobileShell'
import { useCallback, useEffect, useState } from 'react'
import { initialData } from './data'
import type { AppData } from './data'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from './config/features'
import Landing from './screens/Landing'
import BasicInfo from './screens/BasicInfo'
import EntranceSetup from './screens/EntranceSetup'
import OrderEditor from './screens/OrderEditor'
import PersonReg from './screens/PersonReg'
import AtmosphereSelect from './screens/AtmosphereSelect'
import Preview from './screens/Preview'
import FinalOutput from './screens/FinalOutput'
import Admin from './screens/Admin'
import McPage from './screens/McPage'
import VideoPage from './screens/VideoPage'
import VideoEditorPage from './screens/VideoEditorPage'
import { readMarketingRoute } from './lib/marketingRoutes'
import {
  clearAppSession,
  coerceFlowScreen,
  loadAppSession,
  saveAppSession,
  type FlowScreen,
  type StoredAppSession,
} from './lib/appSession'
import { isValidCueSavePhone, normalizeCueSavePhone } from './lib/cueSavePhone'
import {
  fetchSavedCueSheetByPhone,
  hasRestorableCueSheetData,
  persistCueSheetDraftToServer,
  saveCueSheetDraft,
} from './lib/cueSheetDraft'

type Screen = 'landing' | FlowScreen | 'admin'

const SCREENS: Screen[] = ENTRANCE_AUDIO_TIMING_ENABLED
  ? ['landing', 'basic', 'entrance', 'order', 'persons', 'atmosphere', 'preview', 'output']
  : ['landing', 'basic', 'order', 'persons', 'atmosphere', 'preview', 'output']

export default function App() {
  const marketingRoute = readMarketingRoute()
  const [screen, setScreen] = useState<Screen>('landing')
  const [data, setData] = useState<AppData>(initialData)
  const [savedSession, setSavedSession] = useState<StoredAppSession | null>(() => loadAppSession())

  const persistProgress = useCallback((nextScreen: Screen, nextData: AppData) => {
    if (nextScreen === 'admin') return
    saveAppSession(nextScreen, nextData)
    saveCueSheetDraft(nextData)
    setSavedSession(loadAppSession())
    if (nextScreen !== 'landing') {
      const phone = normalizeCueSavePhone(nextData.cueSavePhone)
      if (isValidCueSavePhone(phone) && hasRestorableCueSheetData(nextData)) {
        persistCueSheetDraftToServer(nextData, nextScreen as FlowScreen).catch(() => {})
      }
    }
  }, [])

  useEffect(() => {
    if (marketingRoute) return
    persistProgress(screen, data)
  }, [screen, data, marketingRoute, persistProgress])

  useEffect(() => {
    if (marketingRoute) return
    const onPageHide = () => persistProgress(screen, data)
    window.addEventListener('pagehide', onPageHide)
    return () => window.removeEventListener('pagehide', onPageHide)
  }, [screen, data, marketingRoute, persistProgress])

  useEffect(() => {
    if (marketingRoute) return
    if (screen === 'landing' || screen === 'admin') return
    const phone = normalizeCueSavePhone(data.cueSavePhone)
    if (!isValidCueSavePhone(phone) || !hasRestorableCueSheetData(data)) return
    const flowScreen = screen as FlowScreen
    const timer = window.setTimeout(() => {
      persistCueSheetDraftToServer(data, flowScreen).catch(() => {})
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [data, screen, marketingRoute])

  if (marketingRoute === 'mc') {
    return (
      <MobileShell>
        <McPage />
      </MobileShell>
    )
  }

  if (marketingRoute === 'video-edit') {
    return (
      <MobileShell>
        <VideoEditorPage />
      </MobileShell>
    )
  }

  if (marketingRoute === 'video') {
    return (
      <MobileShell>
        <VideoPage />
      </MobileShell>
    )
  }

  const goNext = () => {
    const idx = SCREENS.indexOf(screen)
    if (idx < SCREENS.length - 1) setScreen(SCREENS[idx + 1])
  }

  const goBack = () => {
    const idx = SCREENS.indexOf(screen)
    if (idx > 0) setScreen(SCREENS[idx - 1])
  }

  const handleStartFresh = () => {
    clearAppSession()
    setSavedSession(null)
    setData(initialData)
    setScreen('basic')
  }

  const handleRestoreSession = () => {
    const session = loadAppSession()
    if (!session) {
      setSavedSession(null)
      return
    }
    setData(session.data)
    setScreen(session.screen)
  }

  const handleCompleteCueSheet = async () => {
    saveAppSession('output', data)
    saveCueSheetDraft(data)
    const phone = normalizeCueSavePhone(data.cueSavePhone)
    if (!isValidCueSavePhone(phone)) {
      throw new Error('QCT 저장용 전화번호가 필요합니다. 기본 정보에서 입력해 주세요.')
    }
    if (!hasRestorableCueSheetData(data)) {
      throw new Error('예식 정보가 부족합니다. 기본 정보를 확인해 주세요.')
    }
    await persistCueSheetDraftToServer(data, 'output')
    setScreen('output')
    setSavedSession(loadAppSession())
  }

  const handleLoadQct = async (phoneInput: string) => {
    const saved = await fetchSavedCueSheetByPhone(phoneInput)
    if (!saved) {
      throw new Error('이 번호로 저장된 QCT가 없습니다.')
    }
    setData(saved.data)
    const nextScreen = coerceFlowScreen(saved.flowScreen)
    setScreen(nextScreen)
    saveAppSession(nextScreen, saved.data)
    saveCueSheetDraft(saved.data)
    setSavedSession(loadAppSession())
  }

  const props = { data, setData, onNext: goNext, onBack: goBack }

  return (
    <MobileShell className={screen === 'landing' ? 'mobile-shell--landing' : ''}>
      {screen === 'landing' && (
        <Landing
          {...props}
          savedSession={savedSession}
          onStart={handleStartFresh}
          onRestore={handleRestoreSession}
          onLoadQct={handleLoadQct}
          onAdmin={() => setScreen('admin')}
        />
      )}
      {screen === 'basic' && <BasicInfo {...props} />}
      {ENTRANCE_AUDIO_TIMING_ENABLED && screen === 'entrance' && <EntranceSetup {...props} />}
      {screen === 'order' && <OrderEditor {...props} />}
      {screen === 'persons' && <PersonReg {...props} />}
      {screen === 'atmosphere' && <AtmosphereSelect {...props} />}
      {screen === 'preview' && <Preview {...props} onGoOutput={handleCompleteCueSheet} />}
      {screen === 'output' && <FinalOutput {...props} />}
      {screen === 'admin' && <Admin onBack={() => setScreen('landing')} />}
    </MobileShell>
  )
}
