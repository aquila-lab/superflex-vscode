export type FigmaTokenInformation = {
  accessToken: string
  refreshToken: string
}

export type FigmaSelectionUrlExtract = {
  fileID: string
  nodeID: string
}

/**
 * Extracts the fileID and nodeID from a Figma selection URL
 *
 * @param figmaSelectionLink Figma selection link. Example: https://www.figma.com/design/GAo9lY4bIk8j2UBUwU33l9/Wireframing-in-Figma?node-id=0-761&t=1QgxKWtCMVPD6cci-4
 * @returns Extracted fileID and nodeID from the URL or undefined if the URL is invalid
 */
export function extractFigmaSelectionUrl(
  figmaSelectionLink: string
): FigmaSelectionUrlExtract | undefined {
  try {
    // Parse the URL
    const parsedUrl = new URL(figmaSelectionLink)

    // Check URL hostname
    if (!parsedUrl.hostname.endsWith("figma.com"))
      return undefined;

    // Get the path segments
    const pathSegments = parsedUrl.pathname.split('/')
    if (pathSegments.length < 4) {
      return undefined
    }

    // File ID is the 3rd segment
    const fileID = pathSegments[2]

    // Get the node-id from query parameters
    const nodeID = parsedUrl.searchParams.get('node-id')
    if (!nodeID) {
      return undefined
    }

    return { fileID, nodeID }
  } catch (_) {
    return undefined
  }
}
