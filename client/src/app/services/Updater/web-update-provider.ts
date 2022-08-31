import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AudioMetadata } from "src/app/interfaces/audio-metadata";
import { environment } from "src/environments/environment";
import { UpdateProvider } from "./update-provider";

export class WebUpdateProvider implements UpdateProvider {
    constructor(private http: HttpClient) {}

    public getMetadata(version: string = "latest"): Observable<AudioMetadata> {
        return this.http.get<AudioMetadata>(`${environment.backend.releaseEndpoint}/${version}`);
    }

    public getMedia(fileKey: string): Observable<ArrayBuffer> {
        return this.http.get(`${environment.backend.audioEndpoint}/${fileKey}`, {
            responseType: "arraybuffer",
        });
    }
}