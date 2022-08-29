import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AudioMetadata } from "src/app/interfaces/audio-metadata";
import { environment } from "src/environments/environment";
import { UpdateProvider } from "./update-provider";

export class WebUpdateProvider implements UpdateProvider {
    constructor(private http: HttpClient) {}

    public getMetadata(version: string = "latest"): Observable<AudioMetadata> {
        // TODO: Handle timeouts/other API errors
        return this.http.get<AudioMetadata>(`${this.releaseEndpointApi()}/${version}`);
    }

    public getMedia(fileKey: string): Observable<ArrayBuffer> {
        // TODO: Handle timeouts/other API errors
        return this.http.get(`${this.audioEndpointApi()}/${fileKey}`, {
            responseType: "arraybuffer",
        });
    }

    private releaseEndpointApi() {
        // TODO: Move this into config
        return `${environment.backend.endpoint}/api/v1/release`;
    }

    private audioEndpointApi() {
        // TODO: Move this into config
        return `${environment.backend.endpoint}/api/v1/audio`;
    }
}