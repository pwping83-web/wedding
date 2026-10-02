import BasicInfo from '../../screens/BasicInfo'
import { StoryShell, useFlowStoryProps } from '../storyHelpers'

/** @figma title Screens/BasicInfo */
export default function BasicInfoStory() {
  const props = useFlowStoryProps()
  return (
    <StoryShell>
      <BasicInfo {...props} />
    </StoryShell>
  )
}
