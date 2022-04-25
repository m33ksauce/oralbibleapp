export interface AudioFile {
    file: string,
    id: string
}

export interface AudioMetadata {
    Version: string,
    Categories?: Object[],
    Audio?: AudioFile[]
}