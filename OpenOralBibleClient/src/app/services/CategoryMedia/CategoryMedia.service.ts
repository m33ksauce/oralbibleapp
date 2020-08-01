import { Injectable } from '@angular/core';
import * as metadataFile from 'sample_data/metadata.json';
import { Category } from 'src/app/models/Category';
import { MediaItem } from 'src/app/models/MediaItem';
import { AudioMedia } from 'src/app/models/AudioMedia';
import { DatabaseService } from '../Database/Database.service';
import { SQLiteObject } from '@ionic-native/sqlite';

@Injectable({
    providedIn: 'root',
})

export class CategoryMediaService {

    constructor() {}

    private getCategories(): Category[] {
        return metadataFile.Category as Category[];
    }

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
        return this.getCategories().find(c => c.children.includes(id)).id;
    }

    getAvailable(id?: string): MediaItem[] {
        if (id === undefined) {
            id = "0";
        }
        var category = this.getCategories().find(c => c.id == id);
        if (category != undefined) {
            return category.children
                .map(id => this.getCategory(id));
        }
    }

    getCategory(id?: string): MediaItem {
        if (id === undefined) {
            id = "0";
        }
        var category = this.getCategories()
            .find(cat => cat.id == id);
        return this.formatCategory(category);
    }

    getNext(id: string): AudioMedia {
        if (this.hasChildren(id)) {
            return this.getAvailable(id).shift();
        }
        var parentId = this.getParent(id);
        var siblings = this.getAvailable(parentId);
        var index = siblings.findIndex(cat => cat.id == id);
        if (index === siblings.length - 1) {
            return this.getNext(parentId);
        }
        console.log(siblings);
        return siblings[index + 1];
    }

    getPrevious(id: string): AudioMedia {
        if (this.hasChildren(id)) {
            return this.getAvailable(id).pop();
        }
        var parentId = this.getParent(id);
        var siblings = this.getAvailable(parentId);
        var index = siblings.findIndex(cat => cat.id == id);
        if (index === 0) {
            return this.getPrevious(parentId);
        }
        console.log(siblings);
        return siblings[index - 1];
    }

    hasChildren(id: string) {
        if (this.getCategories().find(c => c.id == id).children) {
            return true;
        }
        return false;
    }

    formatCategory(realData: MediaItem): MediaItem {
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