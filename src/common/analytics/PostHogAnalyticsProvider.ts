import { Analytics } from "./types";
import { AnalyticsProvider } from "./AnalyticsProvider";

export default class PostHogAnalyticsProvider implements AnalyticsProvider {
  client?: any;
  uniqueID?: string;

  async capture(event: string, properties: { [key: string]: any }): Promise<void> {
    this.client?.capture({
      distinctID: this.uniqueID,
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

        const { PostHog } = await import("posthog-node");
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
