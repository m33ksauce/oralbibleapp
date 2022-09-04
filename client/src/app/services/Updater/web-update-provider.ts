import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, retry, map } from "rxjs/operators";
import { AudioMetadata } from "src/app/interfaces/audio-metadata";
import { environment } from "src/environments/environment";
import { UpdateProvider } from "./update-provider";

export class WebUpdateProvider implements UpdateProvider {
    constructor(private http: HttpClient) { }

    public GetMetadata(version: string = "latest"): Observable<AudioMetadata> {
        return this.fetchMetadata(version).pipe(
            retry(3),
            catchError(this.handleError)
        );
    }

    public GetMedia(fileKey: string): Observable<ArrayBuffer> {
        return this.fetchMedia(fileKey).pipe(
            catchError(this.handleError)
        );
    }

    private fetchMetadata(version: string): Observable<AudioMetadata> {
        return this.http.get<AudioMetadata>(`${environment.backend.releaseEndpoint}/${version}`);
    }

    private fetchMedia(fileKey: string): Observable<ArrayBuffer> {
        return this.http.get(`${environment.backend.audioEndpoint}/${fileKey}`, {
            responseType: "arraybuffer",
        });
    }

    private handleError(err: HttpErrorResponse) {
        if (err.status === 0) {
            // A client-side or network error occurred. Handle it accordingly.
            console.error('An error occurred:', err.error);
        } else {
            // The backend returned an unsuccessful response code.
            // The response body may contain clues as to what went wrong.
            console.error(
                `Backend returned code ${err.status}, body was: `, err.error);
        }

        return throwError(new Error('Something bad happened; please try again later.'));
    }
}