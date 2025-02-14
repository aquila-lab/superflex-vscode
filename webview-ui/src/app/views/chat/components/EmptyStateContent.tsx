import { Hints } from './empty/Hints'
import { WelcomeMessage } from './empty/WelcomeMessage'

export const EmptyStateContent = () => (
  <div className='flex flex-col gap-y-2 mb-4'>
    <WelcomeMessage />
    <Hints />
  </div>
)
