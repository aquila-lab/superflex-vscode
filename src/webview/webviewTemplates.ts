import { Uri } from "vscode";

export const createWebviewHTMLTemplate = (
  scriptSrc: Uri,
  cssSrc: Uri,
  codiconsSrc: Uri
): string => `
<!DOCTYPE html>
<html lang="en" style="margin: 0; padding: 0; min-width: 100%; min-height: 100%">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>ElementAI</title>

    <link href="${cssSrc}" rel="stylesheet" />
    <link href="${codiconsSrc}" rel="stylesheet" />
  </head>
  <body style="margin: 0; padding: 0; min-width: 100%; min-height: 100%">
    <div id="root"></div>
    <script src="${scriptSrc}"></script>
  </body>
</html>`;
