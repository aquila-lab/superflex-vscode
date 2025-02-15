import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useEditMode } from '../../providers/EditModeProvider'
import { InputProvider } from '../../providers/InputProvider'
import { UserMessageHeader } from '../message/user/UserMessageHeader'
import { Attachment } from './attachment/Attachment'
import { FigmaSelectionModal } from './attachment/FigmaSelectionModal'
import { Fragment, type ReactNode } from 'react'

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
          <FigmaSelectionModal />
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
      <FigmaSelectionModal />
    </InputProvider>
  )
}
