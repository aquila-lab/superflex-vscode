import { OverlayProvider } from '../../layers/authenticated/providers/OverlayProvider'
import { ChatContent } from './components/ChatContent'
import { CurrentFileHandler } from './components/CurrentFileHandler'
import { FigmaPremiumModal } from './components/modals/FigmaPremiumModal'
import { SoftLimitModal } from './components/modals/SoftLimitModal'
import { OutOfRequestsGuard } from './components/oor/OutOfRequestsGuard'
import { CodeApplyStateProvider } from './providers/CodeApplyStateProvider'
import { CodeBlockLoadingProvider } from './providers/CodeBlockLoadingProvider'
import { FigmaPremiumModalProvider } from './providers/FigmaPremiumModalProvider'

export const ChatView = () => (
  <OutOfRequestsGuard>
    <CodeBlockLoadingProvider>
      <CurrentFileHandler>
        <FigmaPremiumModalProvider>
          <CodeApplyStateProvider>
            <OverlayProvider>
              <ChatContent />
              <FigmaPremiumModal />
              <SoftLimitModal />
            </OverlayProvider>
          </CodeApplyStateProvider>
        </FigmaPremiumModalProvider>
      </CurrentFileHandler>
    </CodeBlockLoadingProvider>
  </OutOfRequestsGuard>
)
