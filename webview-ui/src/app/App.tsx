import { GlobalProvider } from './layers/global/providers/GlobalProvider'
import { MessageBusProvider } from './layers/global/providers/MessageBusProvider'
import { VSCodeProvider } from './layers/global/providers/VSCodeProvider'
import { Router } from './layers/global/router/Router'

export const App = () => {
  return (
    <VSCodeProvider>
      <MessageBusProvider>
        <GlobalProvider>
          <Router />
        </GlobalProvider>
      </MessageBusProvider>
    </VSCodeProvider>
  )
}
