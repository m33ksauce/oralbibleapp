import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MetadataService } from '../Metadata/metadata.service';
import { StorageService } from '../Storage/storage.service';
import { StorageKeys } from '../Storage/storageKeys';
import { UpdateMethods, UpdateProvider } from './update-provider';
import { WebUpdateProvider } from './web-update-provider';
import * as semver from 'semver';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { Observable, Subscriber, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { Buffer } from "buffer";

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

  public Update(): Observable<string> {
    return this.stageUpdate()
  }

  private stageUpdate(): Observable<string> {
    return new Observable<string>(sub => {
      this.provider.getMetadata().pipe(first()).subscribe(data => {
        sub.next("Checking for updates...");
        var newVersion = data.Version;
        var updating = true;
        this.storage.getKey<string>(StorageKeys.Version).pipe(first()).subscribe(currentVersion => {
          if (!semver.valid(newVersion)) {
            console.log("Couldn't update - version not valid")
            sub.next("Error!");
            sub.complete();
            return
          };
          
          
          if (semver.lt(newVersion, currentVersion)) {
            console.log("Couldn't update - new version older than current version");
            sub.next("Error!");
            sub.complete();
            return
          }
  
          this.storage.setKey<AudioMetadata>(StorageKeys.StageMetadata, data).then(async () => {
            sub.next("Update found! Syncing now!");
            this.syncStageMedia(sub)
          })
        })
      });
    });
  }

  private syncStageMedia(sub: Subscriber<string>)  {
    this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(md => {
      var keys = [];
      var total = (md as AudioMetadata).Audio.length;
      (md as AudioMetadata).Audio.forEach((item, index) => {
        sub.next(`Syncing ${index + 1}/${total}`);
        this.storage.checkKey(StorageKeys.MakeMediaKey(item.id))
          .then(exists => {
            if (!exists) {
              this.provider.getMedia(item.id).subscribe(async media => {
                console.log(`Syncing ${item.id}...`);
                this.storage.setKey(StorageKeys.MakeMediaKey(item.id), Buffer.from(media))
                  .then(async  _ => {
                    if (await this.isStageMediaReady) {
                      return this.finalizeUpdate(sub);
                    }
                  });
              });
            }
          })
      })
    })
  }

  private finalizeUpdate(sub: Subscriber<string>) {
    this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(async data => {
      sub.next("Finalizing")
      await this.storage.setKey<AudioMetadata>(StorageKeys.CurrentMetadata, data);
      await this.storage.setKey<string>(StorageKeys.Version, data.Version);
      sub.next("Updated!")
      sub.complete();
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
      this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(data => {
        Promise.all(data.Audio.map(a => this.storage.checkKey(StorageKeys.MakeMediaKey(a.id)))).then(keys => {
          resolve(keys.reduce((curr, nxt) => curr && nxt, true));
        })
      })
    })
  }
}
