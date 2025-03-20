import { SettingsCard } from '../base/SettingsCard'
import { Button } from '../../../../../common/ui/Button'
import { ExternalLinkIcon } from '@radix-ui/react-icons'

export const FeedbackCard = () => {
  const feedbackUrl = 'https://forms.gle/aUZjzeUzLnrmJvdR7'
  const supportEmail = 'boris@superflex.ai'

  return (
    <SettingsCard title='Support & Feedback'>
      <div className='space-y-6'>
        <div className='flex flex-col gap-2'>
          <h3 className='text-sm text-muted-foreground'>
            Have feedback? We'd love to learn from you!
          </h3>
          <p className='text-xs text-muted-secondary-foreground'>
            Your thoughts help us improve. Share your experience, suggest
            features, or report issues, it only takes a minute!
          </p>
        </div>

        <Button
          className='w-full'
          variant='outline'
          onClick={() => window.open(feedbackUrl)}
        >
          Leave Feedback <ExternalLinkIcon className='h-4 w-4' />
        </Button>

        <div className='flex flex-col gap-2'>
          <h3 className='text-sm text-muted-foreground'>
            Need help? We're here for you!
          </h3>
          <p className='text-xs text-muted-secondary-foreground'>
            If you're experiencing issues or have any questions, don't hesitate
            to reach out.
          </p>
          <p className='text-sm text-muted-foreground'>
            <span className='text-muted-foreground'>Contact Support: </span>
            <a
              href={`mailto:${supportEmail}`}
              className='hover:underline'
            >
              {supportEmail}
            </a>
          </p>
        </div>
      </div>
    </SettingsCard>
  )
}
