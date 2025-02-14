import { Hints } from './Hints'
import { WelcomeMessage } from './WelcomeMessage'

export const EmptyStateContent = () => (
  <div className='flex flex-col gap-y-2 mb-4'>
    <WelcomeMessage />
    <Hints />
  </div>
)
