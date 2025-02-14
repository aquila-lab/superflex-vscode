import { GlobalProvider } from './layers/global/providers/GlobalProvider'
import { VSCodeProvider } from './layers/global/providers/VSCodeProvider'
import { Router } from './layers/global/router/Router'

export const App = () => {
  return (
    <VSCodeProvider>
      <GlobalProvider>
        <Router />
      </GlobalProvider>
    </VSCodeProvider>
  )
}
