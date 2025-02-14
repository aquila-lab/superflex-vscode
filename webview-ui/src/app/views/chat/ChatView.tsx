import { FigmaPremiumModal } from './components/modals/FigmaPremiumModal'
import { FigmaPremiumModalProvider } from './providers/FigmaPremiumModalProvider'
import { ChatContent } from './components/ChatContent'
import { CurrentFileHandler } from './components/CurrentFileHandler'
import { OutOfRequestsGuard } from './components/oor/OutOfRequestsGuard'
import { SoftLimitModal } from './components/modals/SoftLimitModal'

export const ChatView = () => (
  <OutOfRequestsGuard>
    <CurrentFileHandler>
      <FigmaPremiumModalProvider>
        <ChatContent />
        <FigmaPremiumModal />
        <SoftLimitModal />
      </FigmaPremiumModalProvider>
    </CurrentFileHandler>
  </OutOfRequestsGuard>
)
