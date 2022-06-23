import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AudioMetadata } from "src/app/interfaces/audio-metadata";
import { environment } from "src/environments/environment";
import { UpdateProvider } from "./update-provider";

export class FirebaseUpdateProvider implements UpdateProvider {
    constructor(private http: HttpClient) {}

    public getMetadata(version: string = "latest"): Observable<AudioMetadata> {
        return this.http.get<AudioMetadata>(`${this.releaseEndpointApi()}/${version}`);
    }

    public getMedia(fileKey: string): Observable<ArrayBuffer> {
        return this.http.get(`${this.audioEndpointApi()}/${fileKey}`, {
            responseType: "arraybuffer",
        });
    }

    private releaseEndpointApi() {
        return `${environment.backend.endpoint}/api/v1/release`;
    }

    private audioEndpointApi() {
        return `${environment.backend.endpoint}/api/v1/audio`;
    }
}