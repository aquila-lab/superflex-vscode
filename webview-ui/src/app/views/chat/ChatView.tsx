import { FigmaPremiumModal } from './components/FigmaPremiumModal'
import { FigmaPremiumModalProvider } from './providers/FigmaPremiumModalProvider'
import { ChatContent } from './components/ChatContent'
import { CurrentFileHandler } from './components/CurrentFileHandler'
import { OutOfRequestsGuard } from './components/OutOfRequestsGuard'

export const ChatView = () => (
  <OutOfRequestsGuard>
    <CurrentFileHandler>
      <FigmaPremiumModalProvider>
        <ChatContent />
        <FigmaPremiumModal />
      </FigmaPremiumModalProvider>
    </CurrentFileHandler>
  </OutOfRequestsGuard>
)
