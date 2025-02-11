import { PostHog } from 'posthog-node'
import type { AnalyticsProvider } from './AnalyticsProvider'
import type { Analytics } from './types'

export default class PostHogAnalyticsProvider implements AnalyticsProvider {
  client?: PostHog
  uniqueID?: string

  async identify(properties: { [key: string]: any }): Promise<void> {
    this.client?.identify({
      distinctId: this.uniqueID ?? 'NOT_UNIQUE',
      properties
    })
  }

  async capture(
    event: string,
    properties: { [key: string]: any }
  ): Promise<void> {
    this.client?.capture({
      distinctId: this.uniqueID ?? 'NOT_UNIQUE',
      event,
      properties
    })
  }

  async setup(config: Analytics, uniqueID: string): Promise<void> {
    if (!config || !config.clientKey || !config.url) {
      this.client = undefined
    } else {
      try {
        this.uniqueID = uniqueID

        this.client = new PostHog(config.clientKey, {
          host: config.url
        })
      } catch (e) {
        console.error(`Failed to setup telemetry: ${e}`)
      }
    }
  }

  async shutdown(): Promise<void> {
    this.client?.shutdown()
  }
}
