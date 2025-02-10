import { useCallback } from 'react'
import { Button } from '../../components/ui/Button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../components/ui/Card'
import { useGlobal } from '../../context/GlobalContext'
import { useUser } from '../../context/UserContext'

export const UserInfoCard = () => {
  const { isFigmaAuthenticated, connectFigma, disconnectFigma, signOut } =
    useGlobal()
  const { user } = useUser()

  const handleConnectFigma = useCallback(() => {
    connectFigma()
  }, [connectFigma])

  const handleDisconnectFigma = useCallback(() => {
    disconnectFigma()
  }, [disconnectFigma])

  const handleSignOut = useCallback(() => {
    signOut()
  }, [signOut])

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex flex-col gap-2 sm:flex-row sm:gap-16 mb-6'>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>
              Username
            </p>
            <p className='text-lg font-semibold'>{user.username}</p>
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-sm font-medium text-muted-foreground'>Email</p>
            <p className='text-lg font-semibold truncate'>{user.email}</p>
          </div>
        </div>
        <div className='flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center'>
          {isFigmaAuthenticated ? (
            <Button variant='destructive' onClick={handleDisconnectFigma}>
              Disconnect Figma
            </Button>
          ) : (
            <Button onClick={handleConnectFigma}>Connect Figma</Button>
          )}
          <Button variant='destructive' onClick={handleSignOut}>
            Sign Out
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
