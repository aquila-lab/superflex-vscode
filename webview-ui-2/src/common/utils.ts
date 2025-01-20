import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import {
  MessageContent,
  MessageType,
  TextContent,
  TextDelta,
  ImageContent,
  FigmaContent,
  Message,
  Role
} from '../../../shared/model';
import { ReactNode } from 'react';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export async function readImageFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const getFileName = (filePath: string): string => {
  return filePath.split(/[/\\]/g).pop() ?? '';
};

export const areMessageContentsEqual = (prevContent: MessageContent, nextContent: MessageContent): boolean => {
  if (prevContent.type !== nextContent.type) return false;

  switch (prevContent.type) {
    case MessageType.Text: {
      const nextTextContent = nextContent as TextContent;
      return prevContent.text === nextTextContent.text;
    }
    case MessageType.TextDelta: {
      const nextDeltaContent = nextContent as TextDelta;
      return prevContent.value === nextDeltaContent.value;
    }
    case MessageType.Image: {
      const nextImageContent = nextContent as ImageContent;
      return prevContent.image === nextImageContent.image;
    }
    case MessageType.Figma: {
      const nextFigmaContent = nextContent as FigmaContent;
      return (
        prevContent.fileID === nextFigmaContent.fileID &&
        prevContent.nodeID === nextFigmaContent.nodeID &&
        prevContent.image === nextFigmaContent.image
      );
    }
    default:
      return false;
  }
};

export const areMessagePropsEqual = (prevProps: { message: Message }, nextProps: { message: Message }) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.threadID === nextProps.message.threadID &&
    prevProps.message.role === nextProps.message.role &&
    prevProps.message.feedback === nextProps.message.feedback &&
    prevProps.message.updatedAt === nextProps.message.updatedAt &&
    areMessageContentsEqual(prevProps.message.content, nextProps.message.content)
  );
};

export const roleClassName: Partial<Record<Role, string>> = {
  [Role.Assistant]: 'prose prose-sm text-sm dark:prose-invert w-full max-w-none'
};
export const defaultClassName = 'flex gap-2 flex-wrap';

export const chatInputDisabledClasses =
"relative p-[1px] rounded-md before:content-[''] before:absolute before:inset-0 before:rounded-md before:p-[1px] before:bg-[length:400%_400%] before:bg-[linear-gradient(115deg,#1bbe84_0%,#331bbe_16%,#be1b55_33%,#a6be1b_55%,#be1b55_67%)] before:animate-[gradient_3s_linear_infinite]";
export const chatInputEnabledClasses = 'border border-border rounded-md overflow-y-auto max-h-96';

export type ApplyState = 'idle' | 'applying' | 'applied';

export interface CodeBlockInfo {
  extension: string;
  filePath?: string;
  startLine?: number;
  endLine?: number;
}

export interface MarkdownCodeProps {
  inline?: boolean;
  isStreaming?: boolean;
  className?: string;
  children?: ReactNode;
}

export interface MarkdownRenderProps {
  role: Role;
  isStreaming?: boolean;
  children: ReactNode;
}
