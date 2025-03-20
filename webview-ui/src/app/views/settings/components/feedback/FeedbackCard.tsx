import { SettingsCard } from '../base/SettingsCard'
import { FeedbackSection } from './FeedbackSection'
import { SupportSection } from './SupportSection'
import { FeedbackButton } from './FeedbackButton'

export const FeedbackCard = () => (
  <SettingsCard title='Support & Feedback'>
    <FeedbackSection />
    <FeedbackButton />
    <SupportSection />
  </SettingsCard>
)
