import Landing from '../../screens/Landing'
import { StoryShell, useFlowStoryProps } from '../storyHelpers'

/** @figma title Screens/Landing description 랜딩 — 세련화 1순위 */
export default function LandingStory() {
  const props = useFlowStoryProps()
  return (
    <StoryShell landing>
      <Landing
        {...props}
        onStart={() => {}}
        onAdmin={() => {}}
      />
    </StoryShell>
  )
}
