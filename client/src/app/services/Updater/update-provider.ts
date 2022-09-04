import { Observable } from "rxjs"
import { AudioMetadata } from "src/app/interfaces/audio-metadata"

export enum UpdateMethods {
    WEB,
}

export interface UpdateProvider {
    GetMetadata(version?: string): Observable<AudioMetadata>
    GetMedia(fileKey: string): Observable<ArrayBuffer>
}