export const StorageKeys = {
    Version: "metadata-version",
    CurrentMetadata: "current-metadata",
    StageMetadata: "stage-metadata",
    AudioFiles: "audio-files",
    AppName: "app-name",
    
    MakeMediaKey: id => `media-${id}`,
}