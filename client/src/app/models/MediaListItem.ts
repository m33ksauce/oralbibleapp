export enum MediaType {
    Category = 1,
    Audio,
}

export class MediaListItem {
    name: string
    type: MediaType
    index?: number
    children?: MediaListItem[]
    audioTargetId?: string

    constructor(name: string, type: MediaType) {
        this.name = name;
        this.type = type;
    }

    public hasChildren(): boolean {
        return (this.children != undefined) && (this.children.length > 0);
    }

    public hasTarget(): boolean {
        return this.audioTargetId != undefined && this.audioTargetId != null;
    }
}