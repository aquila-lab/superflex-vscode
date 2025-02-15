export const InfoField = ({
  label,
  value
}: {
  label: string
  value: string
}) => (
  <div>
    <p className='text-sm font-medium text-muted-foreground'>{label}</p>
    <p className='text-lg font-semibold truncate'>{value}</p>
  </div>
)
