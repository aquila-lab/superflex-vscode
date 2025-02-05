import './App.css'
import { GlobalProvider } from './context/GlobalContext'
import { VSCodeProvider } from './context/VSCodeContext'
import { AppRouter } from './router/AppRouter'

export const App = () => {
  return (
    <VSCodeProvider>
      <GlobalProvider>
        <AppRouter />
      </GlobalProvider>
    </VSCodeProvider>
  )
}
