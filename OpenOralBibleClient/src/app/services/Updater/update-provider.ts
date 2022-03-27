import { Observable } from "rxjs"
import { AudioMetadata } from "src/app/interfaces/audio-metadata"

export enum UpdateMethods {
    WEB,
}

export interface UpdateProvider {
    getMetadata(version?: string): Observable<AudioMetadata>
    getMedia(fileKey: string): Observable<ArrayBuffer>
}