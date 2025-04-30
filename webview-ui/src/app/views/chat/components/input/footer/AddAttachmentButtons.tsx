import { EnhanceSwitch } from '../EnhanceSwitch'
import { SelectFigmaButton } from './SelectFigmaButton'
import { SelectImageButton } from './SelectImageButton'

export const AddAttachmentButtons = () => (
  <div className='flex flex-row items-center gap-1'>
    <EnhanceSwitch />
    <SelectFigmaButton />
    <SelectImageButton />
  </div>
)
