import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MetadataService } from '../Metadata/metadata.service';
import { StorageService } from '../Storage/storage.service';
import { StorageKeys } from '../Storage/storageKeys';
import { UpdateMethods, UpdateProvider } from './update-provider';
import { WebUpdateProvider } from './web-update-provider';

@Injectable({
  providedIn: 'root'
})

export class UpdaterService {
  private provider: UpdateProvider;

  constructor(
    public storage: StorageService,
    private http: HttpClient,
    private metadataService: MetadataService) { }

  public GetUpdater(method: UpdateMethods) {
    if (method === UpdateMethods.WEB) {
      this.provider = new WebUpdateProvider(this.http);
    }
  }

  public Update() {
    console.log("updating...");
    this.provider.getMetadata().subscribe(data => {
      console.log(data);
      this.storage.setKey(StorageKeys.CurrentMetadata, data).then(() => this.metadataService.reload());
    });
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
