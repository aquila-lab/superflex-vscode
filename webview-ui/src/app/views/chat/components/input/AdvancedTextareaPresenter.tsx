import { Fragment, type ReactNode } from 'react'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useEditMode } from '../../providers/EditModeProvider'
import { InputProvider } from '../../providers/InputProvider'
import { UserMessageHeader } from '../message/user/UserMessageHeader'
import { Attachment } from './attachment/Attachment'
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
      <Fragment>
        <Attachment />
        <InputProvider text={text}>
          {children}
          <FigmaSelectionDrawer />
        </InputProvider>
      </Fragment>
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
