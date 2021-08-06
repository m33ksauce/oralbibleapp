export class MediaBundle {
    public Metadata: Metadata;
    public Media: AudioMedia[];

    constructor() {
        this.Metadata = {};
        this.Media = new Array<AudioMedia>()
    }
}

export interface Metadata {
    Version: string;
    Categories?: Object[],
    Audio?: AudioMetadata[]
}

export interface AudioMetadata {
    id: string,
    file: string
}

export interface AudioMedia {
    target: string
    data: ArrayBuffer;
}