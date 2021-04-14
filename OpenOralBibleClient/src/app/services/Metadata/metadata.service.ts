import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { Category } from 'src/app/models/Category';
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
      var item = new MediaListItem(cat["name"], parseInt(cat["type"]));
      this.currentMediaMetadata.push(item)
    });
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
