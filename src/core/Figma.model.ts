export type FigmaTokenInformation = {
  accessToken: string;
  refreshToken: string;
};

interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  absoluteBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fills?: Array<{
    blendMode: string;
    type: string;
    color: {
      r: number;
      g: number;
      b: number;
      a: number;
    };
  }>;
  strokes?: any[];
  strokeWeight?: number;
  strokeAlign?: string;
  effects?: any[];
  characters?: string;
  style?: {
    fontFamily: string;
    fontPostScriptName: string;
    fontWeight: number;
    fontSize: number;
    textAlignHorizontal: string;
    textAlignVertical: string;
    letterSpacing: number;
    lineHeightPx: number;
    lineHeightPercent: number;
    lineHeightPercentFontSize: number;
    lineHeightUnit: string;
  };
  constraints?: {
    vertical: string;
    horizontal: string;
  };
}

interface FigmaResponse {
  name: string;
  lastModified: string;
  nodes: {
    [key: string]: {
      document: FigmaNode;
    };
  };
}

interface ParsedNode {
  id: string;
  name: string;
  type: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  styles?: {
    fontFamily?: string;
    fontWeight?: number;
    fontSize?: number;
    textAlignHorizontal?: string;
    textAlignVertical?: string;
    letterSpacing?: number;
    lineHeightPx?: number;
  };
  color?: {
    r: number;
    g: number;
    b: number;
    a: number;
  };
  text?: string;
}

function extractNecessaryData(node: FigmaNode): ParsedNode {
  const parsedNode: ParsedNode = {
    id: node.id,
    name: node.name,
    type: node.type,
    boundingBox: node.absoluteBoundingBox || { x: 0, y: 0, width: 0, height: 0 },
  };

  if (node.style) {
    parsedNode.styles = {
      fontFamily: node.style.fontFamily,
      fontWeight: node.style.fontWeight,
      fontSize: node.style.fontSize,
      textAlignHorizontal: node.style.textAlignHorizontal,
      textAlignVertical: node.style.textAlignVertical,
      letterSpacing: node.style.letterSpacing,
      lineHeightPx: node.style.lineHeightPx,
    };
  }

  if (node.fills && node.fills.length > 0) {
    parsedNode.color = node.fills[0].color;
  }

  if (node.characters) {
    parsedNode.text = node.characters;
  }

  return parsedNode;
}

export function parseFigmaResponse(figmaResponse: FigmaResponse): ParsedNode[] {
  const parsedNodes: ParsedNode[] = [];

  Object.values(figmaResponse.nodes).forEach((nodeContainer) => {
    const traverse = (node: FigmaNode) => {
      parsedNodes.push(extractNecessaryData(node));
      if (node.children) {
        node.children.forEach(traverse);
      }
    };
    traverse(nodeContainer.document);
  });

  return parsedNodes;
}

type FigmaSelectionUrlExtract = {
  fileID: string;
  nodeID: string;
};

/**
 * Extracts the fileID and nodeID from a Figma selection URL
 *
 * @param figmaSelectionLink Figma selection link. Example: https://www.figma.com/design/GAo9lY4bIk8j2UBUwU33l9/Wireframing-in-Figma?node-id=0-761&t=1QgxKWtCMVPD6cci-4
 * @returns Extracted fileID and nodeID from the URL or undefined if the URL is invalid
 */
export function extractFigmaSelectionUrl(figmaSelectionLink: string): FigmaSelectionUrlExtract | undefined {
  try {
    // Parse the URL
    const parsedUrl = new URL(figmaSelectionLink);

    // Get the path segments
    const pathSegments = parsedUrl.pathname.split("/");
    if (pathSegments.length < 4) {
      return undefined;
    }

    // File ID is the 3rd segment
    const fileID = pathSegments[2];

    // Get the node-id from query parameters
    const nodeID = parsedUrl.searchParams.get("node-id");
    if (!nodeID) {
      return undefined;
    }

    return { fileID, nodeID };
  } catch (err) {
    return undefined;
  }
}
