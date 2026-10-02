import OrderEditor from '../../screens/OrderEditor'
import { StoryShell, useFlowStoryProps } from '../storyHelpers'

/** @figma title Screens/OrderEditor */
export default function OrderEditorStory() {
  const props = useFlowStoryProps()
  return (
    <StoryShell>
      <OrderEditor {...props} />
    </StoryShell>
  )
}
