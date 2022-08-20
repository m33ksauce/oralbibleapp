import { MediaItem } from './MediaItem';

export class Category implements MediaItem {
    id: string;
    title: string;
    children: string[];
    type: string = "category";
    target: string;

    constructor(id: string, title: string) {
        this.id = id;
        this.title = title;
    }
}