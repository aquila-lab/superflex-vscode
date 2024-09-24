import os from "node:os";

import { IS_PROD } from "../constants";
import { Analytics } from "./types";
import { AnalyticsProvider } from "./AnalyticsProvider";
import PostHogAnalyticsProvider from "./PostHogAnalyticsProvider";

export class Telemetry {
  static client: AnalyticsProvider | undefined = undefined;
  static uniqueID = "NOT_UNIQUE";
  static os: string | undefined = undefined;
  static extensionVersion: string | undefined = undefined;

  static async capture(event: string, properties: { [key: string]: any }) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    try {
      Telemetry.client?.capture(event, {
        ...properties,
        os: Telemetry.os,
        extensionVersion: Telemetry.extensionVersion,
      });
    } catch (e) {
      console.error(`Failed to capture event: ${e}`);
    }
  }

  static async setup(allow: boolean, uniqueID: string, extensionVersion: string, config: Analytics) {
    Telemetry.uniqueID = uniqueID;
    Telemetry.os = os.platform();
    Telemetry.extensionVersion = extensionVersion;

    if (!allow || !IS_PROD) {
      Telemetry.client = undefined;
    } else {
      try {
        if (!Telemetry.client) {
          Telemetry.client = new PostHogAnalyticsProvider();
          await Telemetry.client.setup(config, uniqueID);
        }
      } catch (e) {
        console.error(`Failed to setup telemetry: ${e}`);
      }
    }
  }

  static async shutdown() {
    await Telemetry.client?.shutdown();
  }
}
