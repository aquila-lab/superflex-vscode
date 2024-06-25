import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  console.log("ElementAI is now active!");

  let disposable = vscode.commands.registerCommand(
    "elementai.openPanel",
    () => {
      // Create and show a new webview panel
      const panel = vscode.window.createWebviewPanel(
        "elementAI", // Identifies the type of the webview. Used internally
        "ElementAI", // Title of the panel displayed to the user
        vscode.ViewColumn.One, // Editor column to show the new webview panel in.
        {} // Webview options. More details can be found in VS Code API docs
      );

      // Set the webview's initial html content
      panel.webview.html = getWebviewContent();
    }
  );

  context.subscriptions.push(disposable);
}

function getWebviewContent() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>ElementAI</title>
</head>
<body>
    <h1>Welcome to ElementAI</h1>
    <input type="file" id="upload" />
    <div id="chat"></div>
    <script>
        // Here you can write JavaScript for handling file uploads and chat interface
    </script>
</body>
</html>`;
}

export function deactivate() {}
