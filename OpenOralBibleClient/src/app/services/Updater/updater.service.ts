import { Injectable } from '@angular/core';
import { StorageService } from '../Storage/storage.service';
import { StorageKeys } from '../Storage/storageKeys';

@Injectable({
  providedIn: 'root'
})
export class UpdaterService {

  constructor(public storage: StorageService) { }

  private updateMetadata(newData, version) {
    this.storage.setKey(StorageKeys.CurrentMetadata, newData);
    this.storage.setKey(StorageKeys.Version, version);
  }

  private updateMedia(media) {
    media.forEach(
      this.storage.setKey(media.target, media.data)
    )
  }
}
