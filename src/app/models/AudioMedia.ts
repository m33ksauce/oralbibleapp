import { MediaItem } from './MediaItem';

export class AudioMedia implements MediaItem {
    id: string;
    title: string;
    type: string = "audiomedia";
    target: string;

    constructor(id: string, title: string) {
        this.id = id;
        this.title = title;
    }
}