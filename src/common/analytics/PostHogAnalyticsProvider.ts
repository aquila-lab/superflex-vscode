import { Analytics } from "./types";
import { AnalyticsProvider } from "./AnalyticsProvider";
import { PostHog } from "posthog-node";

export default class PostHogAnalyticsProvider implements AnalyticsProvider {
  client?: PostHog;
  uniqueID?: string;

  async identify(properties: { [key: string]: any }): Promise<void> {
    this.client?.identify({
      distinctId: this.uniqueID ?? "NOT_UNIQUE",
      properties,
    });
  }

  async capture(event: string, properties: { [key: string]: any }): Promise<void> {
    this.client?.capture({
      distinctId: this.uniqueID ?? "NOT_UNIQUE",
      event,
      properties,
    });
  }

  async setup(config: Analytics, uniqueID: string, workspaceID?: string): Promise<void> {
    if (!config || !config.clientKey || !config.url) {
      this.client = undefined;
    } else {
      try {
        this.uniqueID = uniqueID;

        this.client = new PostHog(config.clientKey, {
          host: config.url,
        });
      } catch (e) {
        console.error(`Failed to setup telemetry: ${e}`);
      }
    }
  }

  async shutdown(): Promise<void> {
    this.client?.shutdown();
  }
}
