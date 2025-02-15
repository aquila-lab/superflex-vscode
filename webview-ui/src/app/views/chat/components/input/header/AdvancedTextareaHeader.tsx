import { Fragment } from 'react/jsx-runtime'
import { useEditMode } from '../../../providers/EditModeProvider'
import { CodePreview } from './CodePreview'
import { FileSelectorPopover } from './FileSelectorPopover'
import { SelectedFiles } from './SelectedFiles'

export const AdvancedTextareaHeader = () => {
  const { isEditMode } = useEditMode()

  return (
    <Fragment>
      <CodePreview />
      <div className='flex flex-wrap gap-0.5 p-2 pb-0'>
        {isEditMode && <FileSelectorPopover />}
        <SelectedFiles />
      </div>
    </Fragment>
  )
}
