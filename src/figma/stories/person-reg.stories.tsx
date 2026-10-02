import PersonReg from '../../screens/PersonReg'
import { StoryShell, useFlowStoryProps } from '../storyHelpers'

/** @figma title Screens/PersonReg */
export default function PersonRegStory() {
  const props = useFlowStoryProps()
  return (
    <StoryShell>
      <PersonReg {...props} />
    </StoryShell>
  )
}
