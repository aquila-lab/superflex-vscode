export const WelcomeMessage = () => {
  return (
    <div className='flex flex-col gap-y-2 items-center text-center px-6 mb-6'>
      <img
        src={window.superflexLogoUri}
        alt='Superflex Logo'
        className='size-12 mb-4'
      />
      <h1 className='text-2xl font-semibold'>Code with Superflex</h1>
      <p className='text-muted-foreground'>
        Transform designs into code at lightning speed, powered by deep
        understanding of your codebase.
      </p>
    </div>
  )
}
