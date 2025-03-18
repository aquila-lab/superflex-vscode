// Helper function to create the name of the files map
export function createFilesMapName(provider: string, version: number): string {
  return `${provider}-files-map-v${version}.json`.toLocaleLowerCase()
}

// Validates user's prompt before sending it to the backend
export function validateInputMessage(message: string | undefined): string {
  if (!message)
    return "";

  if (containsFigmaURL(message))
    return "Figma URLs are not supported within the text input, please use designated modal for that."

  if (containsURL(message))
    return "URLs are not yet supported within the text input, please update your message and try again."

  return "";
}

function containsFigmaURL(inputString: string): boolean {
    const figmaURLPattern = /https?:\/\/(www\.)?figma\.com\//;    
    return figmaURLPattern.test(inputString);
}

function containsURL(inputString: string): boolean {
    const urlPattern = /https?:\/\/[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\S*)?/;
    return urlPattern.test(inputString);
}