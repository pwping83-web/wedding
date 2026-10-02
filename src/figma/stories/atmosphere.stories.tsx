import AtmosphereSelect from '../../screens/AtmosphereSelect'
import { StoryShell, useFlowStoryProps } from '../storyHelpers'

/** @figma title Screens/AtmosphereSelect */
export default function AtmosphereSelectStory() {
  const props = useFlowStoryProps()
  return (
    <StoryShell>
      <AtmosphereSelect {...props} />
    </StoryShell>
  )
}
