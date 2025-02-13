import { GlobalProvider } from './layer/global/GlobalProvider'
import { Router } from './layer/global/router/Router'
import { VSCodeProvider } from './layer/global/VSCodeProvider'

export const App = () => {
  return (
    <VSCodeProvider>
      <GlobalProvider>
        <Router />
      </GlobalProvider>
    </VSCodeProvider>
  )
}
