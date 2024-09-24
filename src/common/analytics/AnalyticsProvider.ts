import { Analytics } from "./types";

export interface AnalyticsProvider {
  capture(event: string, properties: { [key: string]: any }): Promise<void>;
  setup(config: Analytics, uniqueID: string, workspaceID?: string): Promise<void>;
  shutdown(): Promise<void>;
}
