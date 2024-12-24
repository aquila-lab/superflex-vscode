import * as vscode from "vscode";
import { VerticalDiffCodeLens } from "../../diff/vertical/manager";
import * as providers from "./providers";

const { registerCodeLensProvider } = vscode.languages;

export let verticalPerLineCodeLensProvider: vscode.Disposable | undefined = undefined;
let diffsCodeLensDisposable: vscode.Disposable | undefined = undefined;

/**
 * Registers all CodeLens providers for the Superflex extension.
 */
export function registerAllCodeLensProviders(
  context: vscode.ExtensionContext,
  editorToVerticalDiffCodeLens: Map<string, VerticalDiffCodeLens[]>
) {
  if (verticalPerLineCodeLensProvider) {
    verticalPerLineCodeLensProvider.dispose();
  }

  if (diffsCodeLensDisposable) {
    diffsCodeLensDisposable.dispose();
  }

  const verticalDiffCodeLens = new providers.VerticalPerLineCodeLensProvider(editorToVerticalDiffCodeLens);

  verticalPerLineCodeLensProvider = registerCodeLensProvider("*", verticalDiffCodeLens);

  context.subscriptions.push(verticalPerLineCodeLensProvider);

  return { verticalDiffCodeLens };
}
