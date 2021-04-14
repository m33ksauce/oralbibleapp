export interface MediaItem {
    id: string,
    title: string,
    type: string,
    target: string
}

export class AudioMedia implements MediaItem {
    id: string
    title: string
    type: string
    target: string

    constructor() {}
}