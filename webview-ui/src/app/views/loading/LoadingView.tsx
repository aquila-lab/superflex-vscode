export const LoadingView = () => {
  return (
    <div
      className="
        relative 
        p-[1px] 
        before:content-[''] 
        before:absolute 
        before:inset-0 
        before:p-[1px] 
        before:bg-[length:400%_400%] 
        before:bg-[linear-gradient(115deg,#1bbe84_0%,#331bbe_16%,#be1b55_33%,#a6be1b_55%,#be1b55_67%)] 
        before:animate-[gradient_3s_linear_infinite]"
    >
      <div className='relative flex flex-col bg-sidebar z-10 w-[110%] overflow-hidden -ml-2'>
        <div className='flex items-center justify-center h-[calc(100vh)] overflow-hidden' />
      </div>
    </div>
  )
}
