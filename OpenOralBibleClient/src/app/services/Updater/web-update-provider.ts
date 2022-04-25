import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { AudioMetadata } from "src/app/interfaces/audio-metadata";
import { environment } from "src/environments/environment";
import { UpdateProvider } from "./update-provider";

class metadataApiDto {
    id: string;
    version: string;
    metadata: Object;
    audio: Object;
}

export class WebUpdateProvider implements UpdateProvider {
    constructor(private http: HttpClient) {}

    public getMetadata(version: string = "latest"): Observable<AudioMetadata> {
        return this.http.get<metadataApiDto>(`${this.releaseEndpointApi()}/${version}`).pipe(
            map(dto => {
                return {
                    Version: dto.version,
                    Categories: dto.metadata["categories"],
                    Audio: dto.metadata["audio"]
                }
            })
        );
    }

    public getMedia(fileKey: string): Observable<ArrayBuffer> {
        return new Observable<ArrayBuffer>();
    }

    private releaseEndpointApi() {
        return `${environment.backend.endpoint}/api/v1/release`;
    }
}