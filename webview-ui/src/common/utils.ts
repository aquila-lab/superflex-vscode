import { twMerge } from 'tailwind-merge';
import { clsx, type ClassValue } from 'clsx';

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

interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export const parseHexColor = (hexColor: string): RGBColor => {
  const hex = hexColor.startsWith('#') ? hexColor.slice(1) : hexColor;
  const parsedHex = hex.length > 6 ? hex.slice(0, 6) : hex;

  return {
    r: parseInt(parsedHex.substring(0, 2), 16),
    g: parseInt(parsedHex.substring(2, 4), 16),
    b: parseInt(parsedHex.substring(4, 6), 16)
  };
};
