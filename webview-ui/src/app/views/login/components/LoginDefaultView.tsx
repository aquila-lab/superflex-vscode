import { useCallback } from 'react'
import { EventRequestType } from '../../../../../../shared/protocol'
import { Button } from '../../../../common/ui/Button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '../../../../common/ui/Card'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'

export const LoginDefaultView = () => {
  const postMessage = usePostMessage()

  const handleCreateAccount = useCallback(() => {
    postMessage(EventRequestType.CREATE_ACCOUNT)
    postMessage(EventRequestType.CREATE_AUTH_LINK, {
      action: 'create_account'
    })
  }, [postMessage])

  const handleSignIn = useCallback(() => {
    postMessage(EventRequestType.SIGN_IN)
    postMessage(EventRequestType.CREATE_AUTH_LINK, { action: 'login' })
  }, [postMessage])

  const handleOpenVideo = useCallback(() => {
    postMessage(EventRequestType.OPEN_EXTERNAL_URL, {
      url: 'https://www.youtube.com/watch?v=hNSYwKTxIP8'
    })
  }, [postMessage])

  return (
    <div className='flex flex-col items-center justify-center h-full px-5 pb-4'>
      <Card className='max-w-md my-auto'>
        <CardHeader className='flex justify-center items-center'>
          <img
            src={window.superflexLogoUri}
            alt='Superflex Logo'
            className='w-12 mb-4'
          />
          <CardTitle className='text-center'>
            Supercharge Your Frontend
          </CardTitle>
          <CardDescription>
            An AI-powered assistant for engineers
          </CardDescription>
        </CardHeader>

        <CardContent className='flex flex-col items-center justify-center'>
          <Button
            className='w-full'
            onClick={handleCreateAccount}
          >
            Sign Up
          </Button>
          <div className='text-muted-foreground w-full flex flex-row items-center justify-center gap-1 mt-4'>
            <p>Already have an account?</p>
            <span
              onClick={handleSignIn}
              className='cursor-pointer underline'
            >
              Sign In
            </span>
          </div>
        </CardContent>
      </Card>

      <div className='flex flex-col items-center gap-3 mt-auto mb-8'>
        <p className='text-lg font-semibold'>Watch our onboarding video:</p>
        <div
          className='w-full cursor-pointer relative'
          onClick={handleOpenVideo}
        >
          <div className='absolute inset-0 z-10' />
          <iframe
            className='w-full aspect-video border border-border rounded-lg shadow-sm'
            src='https://www.youtube.com/embed/hNSYwKTxIP8?si=8C9RVdflePElLhJx'
            title='Superflex Onboarding Video'
            frameBorder='0'
            sandbox='allow-forms allow-scripts allow-pointer-lock allow-same-origin allow-top-navigation allow-presentation'
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          />
        </div>
      </div>
    </div>
  )
}
