import { MediaItem } from './MediaItem';

export class Category implements MediaItem {
    id: String;
    title: String;
    children: String[];
    type: String = "category";
    target: String;

    constructor(id: String, title: String) {
        this.id = id;
        this.title = title;
    }
}