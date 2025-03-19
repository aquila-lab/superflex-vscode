import { Node, FileNodesResponse } from "figma-js";
import {
    FigmaImageUrl,
    FigmaValidationErrorType,
    FigmaValidationResult,
    FigmaValidationSeverityType,
} from "shared/model/Figma.model";

function createFigmaValidationResult(
    severity: "error" | "warning" | "success",
    message: string,
    errorType?: FigmaValidationErrorType,
    data?: any
): FigmaValidationResult {
    return {
        severity,
        message,
        ...(errorType && { errorType }),
        ...(data && { data }),
    };
}

function createFigmaValidationError(
    message: string,
    errorType?: FigmaValidationErrorType,
    data?: any
): FigmaValidationResult {
    return createFigmaValidationResult("error", message, errorType, data);
}

function createFigmaValidationWarning(
    message: string,
    errorType?: FigmaValidationErrorType,
    data?: any
): FigmaValidationResult {
    return createFigmaValidationResult("warning", message, errorType, data);
}

function createFigmaValidationSuccess(
    message?: string,
    data?: any
): FigmaValidationResult {
    return createFigmaValidationResult("success", message || "", data);
}

export const createFigmaImageUrl = (config: Omit<FigmaImageUrl, 'toString'>): FigmaImageUrl => ({
  ...config,
  toString: () => config.imageUrl,
});

export class FigmaService {
    static extractSelectionUrlFromResponse(data: any, nodeID: string): FigmaImageUrl {
        const url = data.images[nodeID.replace("-", ":")] ?? data.images[nodeID];
        return createFigmaImageUrl({
            imageUrl: url,
            severity: FigmaValidationSeverityType.Success,
        });
    }

    static validateFigmaSelection(data: FileNodesResponse, nodeID: string): FigmaValidationResult {
        const nodeData = data.nodes[nodeID.replace("-", ":")];

        const document = nodeData?.document;
        // Making sure the selection is not too big, need a more precise check in future
        if (!document || (document.type as string) === "SECTION")
            return createFigmaValidationError(
                "Selection is not supported, please select a frame."
            );

        const frames = this._extractFrames(document);
        if (frames.length === 0)
            return createFigmaValidationError(
                "No frames found in the selection, please update and try again."
            );

        const numberOfFrames = frames.length;
        const framesWithoutAutoLayout = frames.filter(
            (frame) => !this.hasAutoLayout(frame)
        );
        const framesWithAutoLayout =
            numberOfFrames - framesWithoutAutoLayout.length;

        // If there are more than 50% of frames without auto layout, we don't proceed with the code generation
        if (framesWithAutoLayout < framesWithoutAutoLayout.length)
            return createFigmaValidationError(
                "There are too many frames without auto layout in the given selection, please update and try again.",
                FigmaValidationErrorType.TooManyAbsoluteFrames,
                {
                    framesWithoutAutoLayout: framesWithoutAutoLayout.map(
                        (frame) => frame.name
                    ),
                }
            );

        if (framesWithAutoLayout < numberOfFrames)
            return createFigmaValidationWarning(
                "There are frames without auto layout and generated code may not be pixel-perfect. Would you still like to continue?",
                FigmaValidationErrorType.SomeAbsoluteFrames,
                {
                    framesWithoutAutoLayout: framesWithoutAutoLayout.map(
                        (frame) => frame.name
                    ),
                }
            );

        return createFigmaValidationSuccess();
    }

    private static _extractFrames(node: Node, frames: Node[] = []): Node[] {
        // If the current node is a 'Frame', add it to the results.
        if (node.type === "FRAME") {
            frames.push(node);
        }

        // If the node has children, recursively search each child.
        if (
            "children" in node &&
            Array.isArray(node.children) &&
            node.children.length > 0
        ) {
            node.children.forEach((child) => this._extractFrames(child, frames));
        }

        return frames;
    }

    /**
     * Checks if a node has auto layout.
     * @param node - The Figma node to check.
     * @returns True if the node has auto layout.
     */
    static hasAutoLayout(node: Node): boolean {
        if ("layoutPositioning" in node &&
            node.layoutPositioning === "ABSOLUTE")
            return false;

        return (
            "layoutMode" in node &&
            (node.layoutMode === "HORIZONTAL" || node.layoutMode === "VERTICAL")            
        );
    }
}
