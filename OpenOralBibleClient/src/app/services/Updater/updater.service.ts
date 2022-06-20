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
import { first } from 'rxjs/operators';

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
    return this.provider.getMetadata().pipe(first()).subscribe(data => {
      var newVersion = data.Version;
      var updating = true;
      this.storage.getKey<string>(StorageKeys.Version).pipe(first()).subscribe(currentVersion => {
        if (!semver.valid(newVersion)) {
          console.log("Couldn't update - version not valid")
          return;
        };
        
        
        if (semver.lt(newVersion, currentVersion)) {
          console.log("Couldn't update - new version older than current version");
        }

        this.storage.setKey<AudioMetadata>(StorageKeys.StageMetadata, data).then(async () => {
          if (await this.isStageMediaReady()) {
            this.finalizeUpdate();
            return;
          }
          this.syncStageMedia()
        })
      })
    });
  }

  private syncStageMedia()   {
    return this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(md => {
      console.log(md)
      var keys = [];
      (md as AudioMetadata).Audio.forEach(item => {
        console.log(`Syncing ${item.id}...`);
        this.provider.getMedia(item.id).subscribe(async media => {
          this.storage.setKey(StorageKeys.MakeMediaKey(item.id), media)
            .then(async  _ => {
              if (await this.isStageMediaReady) {
                return this.finalizeUpdate();
              }
            });
        });
      })
    })
  }

  private finalizeUpdate() {
    this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(async data => {
      
      console.log("finalizing")
      await this.storage.setKey<AudioMetadata>(StorageKeys.CurrentMetadata, data);
      await this.storage.setKey<string>(StorageKeys.Version, data.Version);
      // this.metadataService.reload();
    });
  }

  private updateMedia(media) {
    media.forEach(
      this.storage.setKey(media.target, media.data)
    )
  }

  private isStageMediaReady(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      console.log("ready")
      this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(data => {
        Promise.all(data.Audio.map(a => this.storage.checkKey(StorageKeys.MakeMediaKey(a.id)))).then(keys => {
          resolve(keys.reduce((curr, nxt) => curr && nxt, true));
        })
      })
    })
  }
}
