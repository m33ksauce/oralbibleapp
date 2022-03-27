import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MetadataService } from '../Metadata/metadata.service';
import { StorageService } from '../Storage/storage.service';
import { StorageKeys } from '../Storage/storageKeys';
import { UpdateMethods, UpdateProvider } from './update-provider';
import { WebUpdateProvider } from './web-update-provider';
import * as semver from 'semver';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';

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
      var newVersion = data.Version;
      this.storage.getKey(StorageKeys.Version).subscribe(currentVersion => {
        if (!semver.valid(newVersion)) {
          console.log("Couldn't update - version not valid")
          return;
        };
        
        if (semver.lt(newVersion, currentVersion)) {
          console.log("Couldn't update - new version older than current version");
        }

        this.storage.setKey(StorageKeys.NextMetadata, data).then(() => {
          this.triggerUpdate();
        })
      })
      this.storage.setKey(StorageKeys.CurrentMetadata, data).then(() => this.metadataService.reload());
    });
  }

  private triggerUpdate() {
    this.syncNextMedia();
  }

  private syncNextMedia() {
    this.storage.getKey(StorageKeys.NextMetadata).subscribe(md => {
      console.log(md)
      var keys = [];
      (md as AudioMetadata).Audio.map(item => {
        console.log(item["id"])
      })
    })
  }

  private updateMetadata(newData, newVersion) {
    
    this.storage.setKey(StorageKeys.CurrentMetadata, newData);
    this.storage.setKey(StorageKeys.Version, newVersion);
  }

  private updateMedia(media) {
    media.forEach(
      this.storage.setKey(media.target, media.data)
    )
  }
}
