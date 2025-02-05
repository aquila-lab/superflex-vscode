import type { Monaco } from "@monaco-editor/react";

declare global {
	interface VsCodeApi {
		postMessage: (msg: unknown) => void;
		setState: <T>(newState: T) => void;
		getState: <T>() => T | undefined;
	}

	interface Window {
		acquireVsCodeApi?: () => VsCodeApi;
		superflexLogoUri: string;
		monaco: Monaco;
	}
}
