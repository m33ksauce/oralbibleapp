import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { MediaListItem, MediaType } from 'src/app/models/MediaListItem';
import { MetadataProviderService } from '../MetadataProvider/metadata-provider.service';

@Injectable({
  providedIn: 'root'
})
export class MetadataService {
  private _metadataProviderService: MetadataProviderService;
  currentMediaMetadata: MediaListItem[] = new Array<MediaListItem>();
  currentMediaSubject: BehaviorSubject<MediaListItem[]> = 
    new BehaviorSubject<MediaListItem[]>(this.currentMediaMetadata);


  constructor(public metadataProviderService: MetadataProviderService) {
    this._metadataProviderService = metadataProviderService;
    this.loadMetadata();
  }

  private loadMetadata() {
    var md = this._metadataProviderService.getRawMetadata();
    this.parseMetadata(md);
  }

  private parseMetadata(md: AudioMetadata) {
    if (!(md.hasOwnProperty("Categories"))) {
      return;
    }
    var categories = md["Categories"];
    categories.forEach(cat => {
      var item = this.parseCategory(cat);
      this.currentMediaMetadata.push(item);
    });
  }

  private parseCategory(cat: any): MediaListItem {
    var name = (cat.name != undefined) ? cat.name : "";
    var mediaType = this.getMediaTypeFromInt(cat.type);
    var res: MediaListItem = new MediaListItem(name, mediaType);

    if (cat.hasOwnProperty("audioTargetId") && typeof(cat["audioTargetId"]) == "string") {
      res.audioTargetId = cat["audioTargetId"];
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

  public getNextMedia(): MediaListItem {
    return;
  }

  public getPreviousMedia(): MediaListItem {
    return;
  }
}
