import type { ReactNode } from 'react'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useEditMode } from '../../providers/EditModeProvider'
import { InputProvider } from '../../providers/InputProvider'
import { UserMessageHeader } from '../message/user/UserMessageHeader'
import { FigmaSelectionDrawer } from './attachment/FigmaSelectionDrawer'

export const AdvancedTextareaPresenter = ({
  text,
  messageId,
  children
}: {
  text?: string | undefined
  messageId?: string
  children: ReactNode
}) => {
  const { isMainTextarea, isDraft } = useEditMode()
  const { user } = useUser()

  if (isMainTextarea) {
    return (
      <InputProvider text={text}>
        {children}
        <FigmaSelectionDrawer />
      </InputProvider>
    )
  }

  return (
    <InputProvider
      text={text}
      id={messageId}
    >
      <UserMessageHeader
        picture={user.picture}
        username={user.username}
        isDraft={isDraft}
      />
      {children}
      <FigmaSelectionDrawer />
    </InputProvider>
  )
}
