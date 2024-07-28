import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

type FigmaSelectionUrlExtract = {
  fileID: string;
  nodeID: string;
};

/**
 * Extracts the fileID and nodeID from a Figma selection URL
 *
 * @param url Figma selection URL
 * @returns Extracted fileID and nodeID from the URL or undefined if the URL is invalid
 */
export function extractFigmaSelectionUrl(url: string): FigmaSelectionUrlExtract | undefined {
  try {
    // Parse the URL
    const parsedUrl = new URL(url);

    // Get the path segments
    const pathSegments = parsedUrl.pathname.split('/');
    if (pathSegments.length < 4) {
      return undefined;
    }

    // File ID is the 3rd segment
    const fileID = pathSegments[2];

    // Get the node-id from query parameters
    const nodeID = parsedUrl.searchParams.get('node-id');
    if (!nodeID) {
      return undefined;
    }

    return { fileID, nodeID };
  } catch (err) {
    return undefined;
  }
}
