import { Injectable } from '@angular/core';
import { StorageService } from '../Storage/storage.service';
import { StorageKeys } from '../Storage/storageKeys';
import { UpdateMethods, UpdateProvider } from './update-provider';
import { WebUpdateProvider } from './web-update-provider';

@Injectable({
  providedIn: 'root'
})

export class UpdaterService {
  private provider: UpdateProvider;

  constructor(public storage: StorageService) { }

  public GetUpdater(method: UpdateMethods) {
    if (method === UpdateMethods.WEB) {
      this.provider = new WebUpdateProvider();
    }
  }

  public Update() {
    console.log("updating...");
    this.provider.getMetadata().then(data => console.log(data.Version));
  }

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
