export type CachedFile = {
  fileID: string;
  createdAt: number;
};

// Reviver function to handle specific deserialization logic for CachedFile
export function cachedFileReviver(key: string, value: any): CachedFile {
  return { ...value };
}

// Helper function to create the name of the files map
export function createFilesMapName(provider: string): string {
  return `${provider}-files-map.json`;
}
