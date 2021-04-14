export enum MediaType {
    Category = 1,
    Audio,
}

export class MediaListItem {
    name: string
    type: MediaType
    contents: any

    constructor(name: string, type: MediaType) {
        this.name = name;
        this.type = type;
    }
}