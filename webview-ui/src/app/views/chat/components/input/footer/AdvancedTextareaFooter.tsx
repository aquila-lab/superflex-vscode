import { useTextareaFooter } from '../../../providers/TextareaFooterProvider'
import { MainTextareaFooter } from './MainTextareaFooter'
import { UserMessageTextareaFooter } from './UserMessageTextareaFooter'

export const AdvancedTextareaFooter = () => {
  const { isEditMode, isMainTextarea } = useTextareaFooter()

  if (!isEditMode) {
    return null
  }

  return isMainTextarea ? <MainTextareaFooter /> : <UserMessageTextareaFooter />
}
