import { FigmaPremiumModal } from './components/modals/FigmaPremiumModal'
import { FigmaPremiumModalProvider } from './providers/FigmaPremiumModalProvider'
import { ChatContent } from './components/ChatContent'
import { CurrentFileHandler } from './components/CurrentFileHandler'
import { OutOfRequestsGuard } from './components/oor/OutOfRequestsGuard'
import { SoftLimitModal } from './components/modals/SoftLimitModal'
import { OverlayProvider } from '../../layers/authenticated/providers/OverlayProvider'

export const ChatView = () => (
  <OutOfRequestsGuard>
    <CurrentFileHandler>
      <FigmaPremiumModalProvider>
        <OverlayProvider>
          <ChatContent />
        </OverlayProvider>
        <FigmaPremiumModal />
        <SoftLimitModal />
      </FigmaPremiumModalProvider>
    </CurrentFileHandler>
  </OutOfRequestsGuard>
)
