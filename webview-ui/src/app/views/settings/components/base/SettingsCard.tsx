import type { ReactNode } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from '../../../../../common/ui/Card'

export const SettingsCard = ({
  title,
  children
}: {
  title: string
  children: ReactNode
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className='space-y-6'>{children}</CardContent>
  </Card>
)
