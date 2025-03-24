import { v4 as uuidv4 } from 'uuid'

export const AppWarningSlug = {
  Unknown: 'unknown',
  SomeAbsoluteFrames: 'some_absolute_frames'
} as const

type AppWarningSlug = (typeof AppWarningSlug)[keyof typeof AppWarningSlug]

export class AppWarning {
  id: string
  slug: AppWarningSlug
  message: string
  data?: any

  constructor(
    message: string,
    slug: AppWarningSlug = AppWarningSlug.Unknown,
    data?: any
  ) {
    this.id = uuidv4()
    this.message = message
    this.slug = slug
    this.data = data
  }
}
