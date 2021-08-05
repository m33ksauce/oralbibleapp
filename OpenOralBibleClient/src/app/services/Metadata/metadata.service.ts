import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
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
    this.storage.getKey("current-metadata").subscribe(md => this.parseMetadata(md as AudioMetadata));
  }

  private parseMetadata(md: AudioMetadata) {
    var curIndex = 0;
    if (md.hasOwnProperty("Categories")) {
      var categories = md["Categories"];
      categories.forEach(cat => {
        var item = this.parseCategory(cat);
        this.currentMediaMetadata.push(item);
      });
    }
    if(md.hasOwnProperty("Audio")) {
      var audio = md["Audio"];
      audio.forEach(ad => {
        var item = this.parseAudio(ad);
        this.currentAudioMetadata.set(item[0], item[1]);
      })
    }
  }

  private parseAudio(item: any) {
    if (!item.hasOwnProperty("id")) {
      throw new Error("no id for this one!");
    }
    var id = item.id;
    var name = item.hasOwnProperty("file") ? item.file : "";
    return [id, name];
  }

  private parseCategory(cat: any): MediaListItem {
    var name = (cat.name != undefined) ? cat.name : "";
    var mediaType = this.getMediaTypeFromInt(cat.type);
    var res: MediaListItem = new MediaListItem(name, mediaType);

    if (cat.hasOwnProperty("audioTargetId") && typeof(cat["audioTargetId"]) == "string") {
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

  private getMediaTypeFromInt(v: Number) {
    switch(v) {
      case 1:
        return MediaType.Category;
      case 2:
        return MediaType.Audio;
      default:
        throw new RangeError();
    }
  }

  public getAvailableMedia(): Observable<MediaListItem[]> {
    return this.currentMediaSubject.asObservable();
  }

  public getAudioFileFromTarget(target: string): string {
    return this.currentAudioMetadata.get(target);
  }

  public getNextMedia(currentIndex: number): MediaListItem {
    var nxt = this.findAtIndex(this.currentMediaMetadata, currentIndex + 1);
    return nxt;
  }

  private findAtIndex(list: MediaListItem[], index: number): MediaListItem {
    var match;
    var nxt = list.find(i => i.index == index);

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
    var nxt = this.findAtIndex(this.currentMediaMetadata, currentIndex - 1);
    return nxt;
  }
}
