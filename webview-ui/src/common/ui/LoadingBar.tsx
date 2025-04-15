import { cn } from '../utils'

export const LoadingBar = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        'h-0.5 w-full bg-[length:400%_400%] bg-[linear-gradient(115deg,#1bbe84_0%,#331bbe_16%,#be1b55_33%,#a6be1b_55%,#be1b55_67%)] animate-[gradient_3s_linear_infinite]',
        className
      )}
    />
  )
}
