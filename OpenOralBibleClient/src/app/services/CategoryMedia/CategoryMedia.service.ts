import { Injectable } from '@angular/core';
import * as metadata from 'sample_data/metadata.json';
import { Category } from 'src/app/models/Category';
import { MediaItem } from 'src/app/models/MediaItem';
import { AudioMedia } from 'src/app/models/AudioMedia';

@Injectable({
    providedIn: 'root',
})

export class CategoryMediaService {
    getAvailable(id?: String): MediaItem[] {
        if (id === undefined) {
            id = "0";
        }
        var category = metadata.Category.find(c => c.id == id);
        if (category != undefined) {
            console.log(category.children.map(this.formatCategory))
            return category.children.map(this.formatCategory);
        }
    }

    formatCategory(id: String): MediaItem {
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