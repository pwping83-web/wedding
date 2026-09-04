import MobileShell from './components/mobile/MobileShell'
import { useState } from 'react'
import { initialData } from './data'
import type { AppData } from './data'
import Landing from './screens/Landing'
import BasicInfo from './screens/BasicInfo'
import EntranceSetup from './screens/EntranceSetup'
import OrderEditor from './screens/OrderEditor'
import PersonReg from './screens/PersonReg'
import AtmosphereSelect from './screens/AtmosphereSelect'
import Preview from './screens/Preview'
import FinalOutput from './screens/FinalOutput'

type Screen = 'landing' | 'basic' | 'entrance' | 'order' | 'persons' | 'atmosphere' | 'preview' | 'output'

const SCREENS: Screen[] = ['landing', 'basic', 'entrance', 'order', 'persons', 'atmosphere', 'preview', 'output']

export default function App() {
  const [screen, setScreen] = useState<Screen>('landing')
  const [data, setData] = useState<AppData>(initialData)

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
    <MobileShell>
      {screen === 'landing' && <Landing {...props} onStart={() => setScreen('basic')} />}
      {screen === 'basic' && <BasicInfo {...props} />}
      {screen === 'entrance' && <EntranceSetup {...props} />}
      {screen === 'order' && <OrderEditor {...props} />}
      {screen === 'persons' && <PersonReg {...props} />}
      {screen === 'atmosphere' && <AtmosphereSelect {...props} />}
      {screen === 'preview' && <Preview {...props} onGoOutput={() => setScreen('output')} />}
      {screen === 'output' && <FinalOutput {...props} />}
    </MobileShell>
  )
}
