import { Injectable } from '@angular/core';
import * as metadata from 'sample_data/metadata.json';
import { AudioMedia } from 'src/app/models/AudioMedia';

@Injectable({
    providedIn: 'root',
})

export class AudioMediaService {
    getMedia(id?: string): AudioMedia {
        if (id == undefined) {
            return;
        }
        var mediaMeta = metadata.Media.find(m => m.id == id)
        var media = new AudioMedia(mediaMeta.id, mediaMeta.title);
        media.target = mediaMeta.target;
        return media;
    }
}