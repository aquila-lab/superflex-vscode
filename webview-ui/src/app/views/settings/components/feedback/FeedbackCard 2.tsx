import { SettingsCard } from '../base/SettingsCard'
import { FeedbackButton } from './FeedbackButton'
import { FeedbackSection } from './FeedbackSection'
import { SupportSection } from './SupportSection'

export const FeedbackCard = () => (
  <SettingsCard title='Support & Feedback'>
    <FeedbackSection />
    <FeedbackButton />
    <SupportSection />
  </SettingsCard>
)
