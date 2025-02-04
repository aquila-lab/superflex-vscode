import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';
import { MessageContent, Message, Role, MessageAttachment } from '../../../shared/model';
import { ReactNode } from 'react';
import { FilePayload } from '../../../shared/protocol';

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
  // Compare text content
  if (prevContent.text !== nextContent.text) return false;

  // Compare fromMessageID
  if (prevContent.fromMessageID !== nextContent.fromMessageID) return false;

  // Compare attachments
  if (!areAttachmentsEqual(prevContent.attachment, nextContent.attachment)) return false;

  // Compare files
  return areFilesEqual(prevContent.files, nextContent.files);
};

// Helper function to compare attachments
const areAttachmentsEqual = (prevAttachment?: MessageAttachment, nextAttachment?: MessageAttachment): boolean => {
  // If both are undefined, they're equal
  if (!prevAttachment && !nextAttachment) return true;
  // If only one is undefined, they're not equal
  if (!prevAttachment || !nextAttachment) return false;

  // Compare image attachments
  if (prevAttachment.image !== nextAttachment.image) return false;

  // Compare Figma attachments
  if (prevAttachment.figma && nextAttachment.figma) {
    return (
      prevAttachment.figma.fileID === nextAttachment.figma.fileID &&
      prevAttachment.figma.nodeID === nextAttachment.figma.nodeID &&
      prevAttachment.figma.imageUrl === nextAttachment.figma.imageUrl
    );
  }

  // If one has Figma and the other doesn't, they're not equal
  if (prevAttachment.figma ?? nextAttachment.figma) return false;

  return true;
};

// Helper function to compare files arrays
const areFilesEqual = (prevFiles?: FilePayload[], nextFiles?: FilePayload[]): boolean => {
  if (!prevFiles || !nextFiles || prevFiles.length !== nextFiles.length) return false;

  return prevFiles.every((prevFile, index) => {
    const nextFile = nextFiles[index];
    return (
      prevFile.path === nextFile.path &&
      prevFile.content === nextFile.content &&
      prevFile.startLine === nextFile.startLine &&
      prevFile.endLine === nextFile.endLine &&
      prevFile.isCurrentOpenFile === nextFile.isCurrentOpenFile
    );
  });
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

export const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  threadID: 'welcome',
  role: Role.Assistant,
  content: {
    text: "Welcome to Superflex! I'm here to help turn your ideas into reality in seconds. Let's work together and get things done—tell me what you'd like to build today!"
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

export const getAvatarConfig = (role: Role, picture?: string, username?: string) => {
  switch (role) {
    case Role.Assistant:
      return {
        src: window.superflexLogoUri,
        alt: 'Superflex Logo',
        fallback: 'S'
      };
    case Role.User:
      return {
        src: picture,
        alt: 'User Avatar',
        fallback: username ? username.charAt(0).toUpperCase() : 'U'
      };
  }
};
