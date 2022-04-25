import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MetadataService } from '../Metadata/metadata.service';
import { StorageService } from '../Storage/storage.service';
import { StorageKeys } from '../Storage/storageKeys';
import { UpdateMethods, UpdateProvider } from './update-provider';
import { WebUpdateProvider } from './web-update-provider';
import * as semver from 'semver';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { Subscription } from 'rxjs';

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
    this.stageUpdate();
  }

  private stageUpdate(): Subscription {
    return this.provider.getMetadata().subscribe(data => {
      var newVersion = data.Version;
      this.storage.getKey(StorageKeys.Version).subscribe(currentVersion => {
        if (!semver.valid(newVersion)) {
          console.log("Couldn't update - version not valid")
          return;
        };
        
        if (semver.lt(newVersion, currentVersion)) {
          console.log("Couldn't update - new version older than current version");
        }

        this.storage.setKey(StorageKeys.StageMetadata, data).then(async () => {
          if (await this.isStageMediaReady()) {
            this.finalizeUpdate();
          }
          this.syncStageMedia()
        })
      })
    });
  }

  private syncStageMedia()   {
    return this.storage.getKey(StorageKeys.StageMetadata).subscribe(md => {
      console.log(md)
      var keys = [];
      (md as AudioMetadata).Audio.forEach(item => {
        console.log(`Syncing ${item.id}...`);
        this.provider.getMedia(item.id).subscribe(media => {
          
        });
      })
    })
  }

  private finalizeUpdate() {
    this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).subscribe(async data => {
      await this.storage.setKey(StorageKeys.CurrentMetadata, data);
      await this.storage.setKey(StorageKeys.Version, data.Version);
      this.metadataService.reload();
    });
  }

  private updateMedia(media) {
    media.forEach(
      this.storage.setKey(media.target, media.data)
    )
  }

  private isStageMediaReady(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).subscribe(data => {
        Promise.all(data.Audio.map(a => this.storage.checkKey(`media-${a.id}`))).then(keys => {
          resolve(keys.reduce((curr, nxt) => curr && nxt, true));
        })
      })
    })
  }
}
