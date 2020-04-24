import { Injectable } from '@angular/core';
import * as metadata from 'sample_data/metadata.json';
import { Category } from 'src/app/models/Category';
import { MediaItem } from 'src/app/models/MediaItem';
import { AudioMedia } from 'src/app/models/AudioMedia';

@Injectable({
    providedIn: 'root',
})

export class CategoryMediaService {
    getBreadcrumbs(id?: string): MediaItem[] {
        var crumbs = new Array<MediaItem>();
        if (id === undefined) {
            id = "0";
        }

        var current = id;
        while (current != "0") {
            crumbs.push(this.getCategory(current));
            current = this.getParent(current);
        }

        return crumbs.reverse();
    }

    getParent(id?: string): string {
        return metadata.Category.find(c => c.children.includes(id)).id;
    }

    getAvailable(id?: string): MediaItem[] {
        if (id === undefined) {
            id = "0";
        }
        var category = metadata.Category.find(c => c.id == id);
        if (category != undefined) {
            return category.children.map(this.formatCategory);
        }
    }

    getCategory(id?: string) {
        if (id === undefined) {
            id = "0";
        }
        return this.formatCategory(id);
    }

    formatCategory(id: string): MediaItem {
        var realData = metadata.Category.find(c => c.id == id);
        if (realData == undefined) { return undefined; }
        if (realData.type == Category.name.toLowerCase()) {
            var cat = new Category(realData.id, realData.title);
            cat.target = `/tabs/bible/${realData.id}`;
            return cat;
        };
        if (realData.type == AudioMedia.name.toLowerCase()) {
            var audio = new AudioMedia(realData.id, realData.title);
            audio.target = `/tabs/player/${realData.id}`;
            return audio;
        };
    }
}