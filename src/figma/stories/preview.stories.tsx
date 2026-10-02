import Preview from '../../screens/Preview'
import { StoryShell, useFlowStoryProps } from '../storyHelpers'

/** @figma title Screens/Preview */
export default function PreviewStory() {
  const props = useFlowStoryProps()
  return (
    <StoryShell>
      <Preview {...props} onGoOutput={() => {}} />
    </StoryShell>
  )
}
