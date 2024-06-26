import { Uri } from "vscode";

export const createWebviewTemplate = (scriptSrc: Uri, cssSrc: Uri): string => `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>ElementAI</title>

    <link href="${cssSrc}" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script src="${scriptSrc}"></script>
  </body>
</html>`;
