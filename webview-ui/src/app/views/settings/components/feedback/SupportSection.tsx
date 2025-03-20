import { SUPPORT_EMAIL } from '../../../../../common/utils'

export const SupportSection = () => (
  <div className='flex flex-col gap-2'>
    <h3 className='text-sm text-muted-foreground'>
      Need help? We're here for you!
    </h3>
    <p className='text-xs text-muted-secondary-foreground'>
      If you're experiencing issues or have any questions, don't hesitate to
      reach out.
    </p>
    <p className='text-sm text-muted-foreground'>
      <span className='text-muted-foreground'>Contact Support: </span>
      <a
        href={`mailto:${SUPPORT_EMAIL}`}
        className='hover:underline'
      >
        {SUPPORT_EMAIL}
      </a>
    </p>
  </div>
)
