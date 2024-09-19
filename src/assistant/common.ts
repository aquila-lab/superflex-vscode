// Helper function to create the name of the files map
export function createFilesMapName(provider: string, version: number): string {
  return `${provider}-files-map-v${version}.json`.toLocaleLowerCase();
}
