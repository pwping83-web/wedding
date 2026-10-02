import FinalOutput from '../../screens/FinalOutput'
import { StoryShell, useFlowStoryProps } from '../storyHelpers'

/** @figma title Screens/FinalOutput */
export default function FinalOutputStory() {
  const props = useFlowStoryProps()
  return (
    <StoryShell>
      <FinalOutput {...props} />
    </StoryShell>
  )
}
