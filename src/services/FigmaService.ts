import type { FileNodesResponse, Node } from 'figma-js'
import { AppError, AppErrorSlug } from 'shared/model/AppError.model'
import { AppWarning, AppWarningSlug } from 'shared/model/AppWarning.model'

export class FigmaService {
  static extractSelectionUrlFromResponse(data: any, nodeID: string): string {
    return data.images[nodeID.replace('-', ':')] ?? data.images[nodeID]
  }

  static validateFigmaSelection(
    data: FileNodesResponse,
    nodeID: string
  ): AppWarning | undefined {
    const nodeData = data.nodes[nodeID.replace('-', ':')]

    const document = nodeData?.document
    // Making sure the selection is not too big, need a more precise check in future
    if (!document || (document.type as string) === 'SECTION') {
      throw new AppError(
        'Selection is not supported, please select a frame.',
        AppErrorSlug.UnsupportedSelection
      )
    }

    const frames = FigmaService._extractFrames(document)
    if (frames.length === 0) {
      throw new AppError(
        'No frames found in the selection, please update and try again.',
        AppErrorSlug.NoFramesFound
      )
    }

    const numberOfFrames = frames.length
    const framesWithoutAutoLayout = frames.filter(
      frame => !FigmaService.hasAutoLayout(frame)
    )
    const framesWithAutoLayout = numberOfFrames - framesWithoutAutoLayout.length

    if (framesWithAutoLayout === 0) {
      throw new AppError(
        'There are no frames with auto layout in the given Figma selection, please add auto layout to the Figma selection and try again.',
        AppErrorSlug.MissingFramesWithoutAutoLayout,
        undefined,
        {
          framesWithoutAutoLayout: framesWithoutAutoLayout.map(
            frame => frame.name
          )
        }
      )
    }

    if (framesWithAutoLayout < numberOfFrames) {
      return new AppWarning(
        'There are frames without auto layout and generated code may not be pixel-perfect. Would you still like to continue?',
        AppWarningSlug.SomeAbsoluteFrames,
        {
          framesWithoutAutoLayout: framesWithoutAutoLayout.map(
            frame => frame.name
          )
        }
      )
    }

    return undefined
  }

  private static _extractFrames(node: Node, frames: Node[] = []): Node[] {
    // If the current node is a 'Frame', add it to the results.
    if (node.type === 'FRAME') {
      frames.push(node)
    }

    // If the node has children, recursively search each child.
    if (
      'children' in node &&
      Array.isArray(node.children) &&
      node.children.length > 0
    ) {
      node.children.forEach((child: any) =>
        FigmaService._extractFrames(child, frames)
      )
    }

    return frames
  }

  /**
   * Checks if a node has auto layout.
   * @param node - The Figma node to check.
   * @returns True if the node has auto layout.
   */
  static hasAutoLayout(node: Node): boolean {
    return (
      'layoutMode' in node &&
      (node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL')
    )
  }
}
