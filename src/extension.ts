import * as vscode from "vscode";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let webview = vscode.commands.registerCommand(
    "react-ext.namasteworld",
    () => {
      let panel = vscode.window.createWebviewPanel(
        "webview",
        "React",
        vscode.ViewColumn.One,
        {
          enableScripts: true,
        }
      );

      let scriptSrc = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "web", "dist", "index.js")
      );

      let cssSrc = panel.webview.asWebviewUri(
        vscode.Uri.joinPath(context.extensionUri, "web", "dist", "index.css")
      );

      panel.webview.html = `<!DOCTYPE html>
        <html lang="en">
          <head>
            <link rel="stylesheet" href="${cssSrc}" />
          </head>
          <body>
            <noscript>You need to enable JavaScript to run this app.</noscript>
            <div id="root"></div>
            <script src="${scriptSrc}"></script>
          </body>
        </html>
        `;
    }
  );

  context.subscriptions.push(webview);
}

// This method is called when your extension is deactivated
export function deactivate() {}
