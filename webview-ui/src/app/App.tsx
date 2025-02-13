import { GlobalProvider } from './layer/global/GlobalProvider'
import { VSCodeProvider } from './layer/global/VSCodeProvider'
import { Router } from './layer/global/router/Router'

export const App = () => {
  return (
    <VSCodeProvider>
      <GlobalProvider>
        <Router />
      </GlobalProvider>
    </VSCodeProvider>
  )
}
