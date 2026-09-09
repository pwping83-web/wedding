import MobileShell from './components/mobile/MobileShell'
import { useEffect, useRef, useState } from 'react'
import { initialData } from './data'
import type { AppData } from './data'
import { ENTRANCE_AUDIO_TIMING_ENABLED } from './config/features'
import { persistCueSheetDraftToServer, saveCueSheetDraft } from './lib/cueSheetDraft'
import Landing from './screens/Landing'
import BasicInfo from './screens/BasicInfo'
import EntranceSetup from './screens/EntranceSetup'
import OrderEditor from './screens/OrderEditor'
import PersonReg from './screens/PersonReg'
import AtmosphereSelect from './screens/AtmosphereSelect'
import Preview from './screens/Preview'
import FinalOutput from './screens/FinalOutput'
import Admin from './screens/Admin'

type Screen = 'landing' | 'basic' | 'entrance' | 'order' | 'persons' | 'atmosphere' | 'preview' | 'output' | 'admin'

const SCREENS: Screen[] = ENTRANCE_AUDIO_TIMING_ENABLED
  ? ['landing', 'basic', 'entrance', 'order', 'persons', 'atmosphere', 'preview', 'output']
  : ['landing', 'basic', 'order', 'persons', 'atmosphere', 'preview', 'output']

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [data, setData] = useState<AppData>(initialData)
  const saveTimerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!data.groomName.trim() || !data.brideName.trim()) return

    saveCueSheetDraft(data)

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    saveTimerRef.current = window.setTimeout(() => {
      void persistCueSheetDraftToServer(data).catch(() => {
        // 서버 저장 실패 시 브라우저 저장본은 유지됩니다.
      })
    }, 1200)

    return () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current)
    }
  }, [data])

  const goNext = () => {
    const idx = SCREENS.indexOf(screen)
    if (idx < SCREENS.length - 1) setScreen(SCREENS[idx + 1])
  }

  const goBack = () => {
    const idx = SCREENS.indexOf(screen)
    if (idx > 0) setScreen(SCREENS[idx - 1])
  }

  const props = { data, setData, onNext: goNext, onBack: goBack }

  return (
    <MobileShell className={screen === 'landing' ? 'mobile-shell--landing' : ''}>
      {screen === 'landing' && (
        <Landing {...props} onStart={() => setScreen('basic')} onAdmin={() => setScreen('admin')} />
      )}
      {screen === 'basic' && <BasicInfo {...props} />}
      {ENTRANCE_AUDIO_TIMING_ENABLED && screen === 'entrance' && <EntranceSetup {...props} />}
      {screen === 'order' && <OrderEditor {...props} />}
      {screen === 'persons' && <PersonReg {...props} />}
      {screen === 'atmosphere' && <AtmosphereSelect {...props} />}
      {screen === 'preview' && <Preview {...props} onGoOutput={() => setScreen('output')} />}
      {screen === 'output' && <FinalOutput {...props} />}
      {screen === 'admin' && <Admin onBack={() => setScreen('landing')} />}
    </MobileShell>
  )
}
