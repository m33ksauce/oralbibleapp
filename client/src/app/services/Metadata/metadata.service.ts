import { Injectable } from '@angular/core';
import { ArgumentOutOfRangeError, BehaviorSubject, Observable, ReplaySubject, Subject, Subscriber, Subscription } from 'rxjs';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { MediaListItem, MediaType } from 'src/app/models/MediaListItem';
import { StorageService } from '../Storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  currentMediaMetadata: MediaListItem[] = new Array<MediaListItem>();
  currentAudioMetadata: Map<string, string> = new Map<string, string>();
  currentMediaSubject: BehaviorSubject<MediaListItem[]> =
    new BehaviorSubject<MediaListItem[]>(this.currentMediaMetadata);

  private index = 0;


  constructor(public storage: StorageService) {
    this.loadMetadata();
  }

  private loadMetadata() {
    this.storage.getKey<AudioMetadata>("current-metadata").subscribe(md => this.parseMetadata(md));
  }

  private clearMetadata() {
    this.currentAudioMetadata = new Map<string, string>();
    this.currentMediaMetadata = new Array<MediaListItem>();
  }

  private parseMetadata(md: AudioMetadata) {
    // TODO: Add error handling
    this.clearMetadata();
    console.log("Parsing metadata")
    // TODO: What happens if we don't have categories?
    if (MetadataService.propertyHasList(md, "Categories")) {
      md["Categories"].forEach(cat => {
        try {
          var item = this.parseCategory(cat);
          this.currentMediaMetadata.push(item);
        } catch (e) {
          console.log(e);
        }
      });
    }
    if (MetadataService.propertyHasList(md, "Audio")) {
      md["Audio"].forEach(ad => {
        try {
          var item = this.parseAudio(ad);
          this.currentAudioMetadata.set(item[0], item[1]);
        } catch (e) {
          console.log(e);
        }
      })
    }
    this.currentMediaSubject.next(this.currentMediaMetadata);
  }

  private parseCategory(cat: any): MediaListItem {
    // TODO: Gracefully handle missing data
    var name = (cat.name != undefined) ? cat.name : "";
    var mediaType = this.getMediaTypeFromInt(cat.type);
    var res: MediaListItem = new MediaListItem(name, mediaType);

    // TODO: Gracefully handle missing audio
    if (cat.hasOwnProperty("audioTargetId") && typeof (cat["audioTargetId"]) == "string") {
      res.audioTargetId = cat["audioTargetId"];
      res.index = this.index++;
    }

    if (cat.hasOwnProperty("children") && cat.children.length != undefined && cat.children.length > 0) {
      res.children = new Array<MediaListItem>();
      cat.children.forEach(child => {
        res.children.push(this.parseCategory(child));
      })
    }

    return res;
  }

  private parseAudio(item: any) {
    if (!item.hasOwnProperty("id")) {
      throw new Error("no id for this one!");
    }
    return [
      item.id,
      item.hasOwnProperty("file") ? item.file : ""
    ];
  }

  private static propertyHasList(md: AudioMetadata, prop: string) {
    return md.hasOwnProperty(prop)
      && md[prop].hasOwnProperty("length")
      && md[prop].length > 0;
  }

  private getMediaTypeFromInt(v: Number) {
    switch (v) {
      case 1:
        return MediaType.Category;
      case 2:
        return MediaType.Audio;
      default:
        throw new RangeError();
    }
  }

  public getAvailableMedia(): Subject<MediaListItem[]> {
    return this.currentMediaSubject;
  }

  public getAudioFileFromTarget(target: string): string {
    return this.currentAudioMetadata.get(target);
  }

  public getNextMedia(currentIndex: number): MediaListItem {
    var nxt = this.findAtIndex(this.currentMediaMetadata, currentIndex + 1);
    return nxt;
  }

  private findAtIndex(list: MediaListItem[], index: number): MediaListItem {
    // TODO: Rewrite to not use searching
    let match;
    let nxt = list.find(i => i.index == index);

    if (nxt != undefined) match = nxt;

    if (nxt == undefined) {
      list.forEach(l => {
        if (l.hasChildren()) {
          var check = this.findAtIndex(l.children, index);
          if (check != undefined) match = check;
        }
      })
    }

    return match;
  }

  public getPrevMedia(currentIndex: number): MediaListItem {
    if (currentIndex == 0) return this.findAtIndex(this.currentMediaMetadata, currentIndex);
    var nxt = this.findAtIndex(this.currentMediaMetadata, currentIndex - 1);
    return nxt;
  }
}
