import type { FigmaTokenInformation, User } from '../../shared/model'
import { PublicApi } from './api'
import { parseError, parseFigmaApiError } from './error'
import { FigmaApi } from './figmaApi'
import { buildUserFromResponse } from './transformers'
import { Node, FileNodesResponse } from "figma-js";

type FigmaRefreshAccessTokenArgs = {
  refreshToken: string
}

type FigmaValidationResult = {
  isValid: boolean,
  severity: "error" | "warning" | "success",
  message: string,
  data?: any
}

function createFigmaValidationResult(
  isValid: boolean,
  severity: "error" | "warning" | "success",
  message: string,
  data?: any
): FigmaValidationResult {
  return {
    isValid,
    severity,
    message,
    ...(data && { data })
  }
}

function createFigmaValidationError(message: string, data?: any): FigmaValidationResult {
  return createFigmaValidationResult(false, "error", message, data);
}

function createFigmaValidationWarning(message: string, data?: any): FigmaValidationResult {
  return createFigmaValidationResult(true, "warning", message, data);
}

function createFigmaValidationSuccess(message?: string, data?: any): FigmaValidationResult {
  return createFigmaValidationResult(true, "success", message || "", data);
}

async function figmaRefreshAccessToken({
  refreshToken
}: FigmaRefreshAccessTokenArgs): Promise<FigmaTokenInformation> {
  try {
    const res = await PublicApi.post('/auth/figma-refresh-token', {
      refresh_token: refreshToken
    })

    return Promise.resolve({
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token
    })
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

async function getFigmaUserInfo(): Promise<User> {
  try {
    const { data } = await FigmaApi.get('/me')
    return Promise.resolve(buildUserFromResponse(data))
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

type GetFigmaSelectionImageUrlArgs = {
  fileID: string
  nodeID: string
}

async function getFigmaSelectionImageUrl({
  fileID,
  nodeID
}: GetFigmaSelectionImageUrlArgs): Promise<string> {
  try {
    const { data } = await FigmaApi.get(`/images/${fileID}?ids=${nodeID}`)
    if (data.err) {
      return Promise.reject(parseError(data.err))
    }

    return Promise.resolve(
      data.images[nodeID.replace('-', ':')] ?? data.images[nodeID]
    )
  } catch (err) {
    const error = parseFigmaApiError(err);
    
    // TODO: add user email
    const userEmail = "user_email@email.com";
    if (error.statusCode == 404) {
      error.message = `File not found or you (${userEmail}) don't have access to it.`;
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
}

async function validateFigmaAttachment({
  fileID,
  nodeID
}: GetFigmaSelectionImageUrlArgs): Promise<FigmaValidationResult> {
  try {
    const { data } = await FigmaApi.get<FileNodesResponse>(`/files/${fileID}/nodes?ids=${nodeID}`)
    const nodeData = data.nodes[nodeID.replace("-", ":")];

    const document = nodeData?.document;
    // Making sure the selection is not too big, need a more precise check in future
    if (!document || (document.type as string) === "SECTION")
      return createFigmaValidationError("Selection is not supported, please select a frame.");

    const frames = _extractFrames(document);
    if (frames.length === 0)
      return createFigmaValidationError("No frames found in the selection, please update and try again.");

    const numberOfFrames = frames.length;
    const framesWithoutAutoLayout = frames.filter(frame => !hasAutoLayout(frame));
    const framesWithAutoLayout = numberOfFrames - framesWithoutAutoLayout.length;

    // If there are more than 50% of frames without auto layout, we don't proceed with the code generation
    if (framesWithAutoLayout < framesWithoutAutoLayout.length)
      return createFigmaValidationError(
        "There are too many frames without auto layout in the given selection, please update and try again.",
        {
          framesWithoutAutoLayout: framesWithoutAutoLayout.map(frame => frame.name)
        }
      );
    
    if (framesWithAutoLayout < numberOfFrames)
      return createFigmaValidationWarning(
        "There are frames without auto layout and generated code may not be pixel-perfect. Would you still like to continue?",
        {
          framesWithoutAutoLayout: framesWithoutAutoLayout.map(frame => frame.name)
        }
      );
    
    return createFigmaValidationSuccess();
  } catch (err) {
    return Promise.reject(parseFigmaApiError(err));
  }
}

function _extractFrames(node: Node): Node[] {
  // Initialize an array to hold matching nodes.
  let frames: Node[] = [];

  // If the current node is a 'Frame', add it to the results.
  if (node.type === "FRAME") {
    frames.push(node);
  }

  // If the node has children, recursively search each child.
  if ("children" in node && Array.isArray(node.children) && node.children.length > 0) {
    node.children.forEach(child => {
      frames = frames.concat(_extractFrames(child));
    });
  }

  return frames;
}

/**
 * Checks if a node has auto layout.
 * @param node - The Figma node to check.
 * @returns True if the node has auto layout.
 */
function hasAutoLayout(node: Node): boolean {
  return "layoutMode" in node && (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL");
}

export { figmaRefreshAccessToken, getFigmaUserInfo, getFigmaSelectionImageUrl, validateFigmaAttachment }
