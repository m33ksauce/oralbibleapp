import { AudioMetadata } from "src/app/interfaces/audio-metadata"

export enum UpdateMethods {
    WEB,
}

export interface UpdateProvider {
    getMetadata(version?: string): Promise<AudioMetadata>
    getMedia(fileKey: string): Promise<ArrayBuffer>
}