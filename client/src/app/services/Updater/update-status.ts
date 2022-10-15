import { BehaviorSubject, Observable } from "rxjs"
import { AudioMetadata } from "src/app/interfaces/audio-metadata"

export enum UpdateStatus {
    READY,
    UPDATING,
    SUCCEEDED,
    FAILED,
}

export class UpdateStatusProvider {
    private currentStatus: [UpdateStatus, string];
    private currentStatusSubject: BehaviorSubject<[UpdateStatus, string]> = 
        new BehaviorSubject<[UpdateStatus, string]>([UpdateStatus.READY, ""]);

    protected SetStatus(status: UpdateStatus, message: string = "") {
        this.currentStatus = [status, message];
        this.currentStatusSubject.next(this.currentStatus);
    }

    protected SubscribeStatus(): Observable<[UpdateStatus, string]> {
        return this.currentStatusSubject.asObservable();
    }

    protected GetCurrentStatus(): [UpdateStatus, string] {
        return this.currentStatus;
    }
}