import { MediaItem } from './MediaItem';

export class AudioMedia implements MediaItem {
    id: String;
    title: String;
    type: String = "audiomedia";
    target: String;

    constructor(id: String, title: String) {
        this.id = id;
        this.title = title;
    }
}