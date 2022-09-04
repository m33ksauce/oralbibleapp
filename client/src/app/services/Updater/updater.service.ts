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
    private http: HttpClient) { }

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
      this.provider.GetMetadata().pipe(first()).subscribe(
        (data) => {
          sub.next("Checking for updates...");
          let newVersion = data.Version;
          this.storage.getKey<string>(StorageKeys.Version).pipe(first()).subscribe(currentVersion => {
            if (!semver.valid(newVersion)) {
              console.log("Couldn't update - version not valid")
              sub.next("Error!");
              sub.complete();
              return
            };


            if (semver.lt(newVersion, currentVersion)) {
              console.log("Couldn't update - new version older than current version");
              sub.next("Already up to date!");
              sub.complete();
              return
            }

            this.storage.setKey<AudioMetadata>(StorageKeys.StageMetadata, data).then(async () => {
              sub.next("Update found!");
              this.syncStageMedia(data, sub)
            })
              .catch((err) => {
                console.log(`Failed to stage metadata: ${err}`);
                this.completeWithError(sub, "Update failed!");
              })
          })
        },
        (err: Error) => {
          console.log(`Failed to get metadata: ${err}`);
          this.completeWithError(sub, "Update failed!");
        });
    });
  }

  private async syncStageMedia(md: AudioMetadata, statusUpdater: Subscriber<string>) {
    console.log("Starting update sync")
    let curr = 0;
    const audio = md.Audio;
    const total = audio.length;
    // Aggregate these promises and finalize once, not multiple times
    let promises = [];

    for (let item of audio) {
      promises.push(this.syncMedia(item.id, statusUpdater).then(() => {
        statusUpdater.next(`Syncing ${++curr}/${total}`);
      }))
    }

    Promise.all(promises).then(
      async () => {
        if (await this.isStageMediaReady) {
          console.log("Finished syncing")
          return this.finalizeUpdate(statusUpdater);
        }
      })
      .catch(() => {
        this.completeWithError(statusUpdater, "Update Failed!");
      })
  }

  private syncMedia(id: string, statusUpdater: Subscriber<string>): Promise<void> {
    return new Promise(async (res, rej) => {
      let exists = await this.storage.checkKey(StorageKeys.MakeMediaKey(id))
      if (exists) res();
      if (!exists) {
        this.provider.GetMedia(id).subscribe(
          (media) => {
            console.log(`Syncing ${id}`);
            this.storage.setKey(StorageKeys.MakeMediaKey(id), Buffer.from(media))
              .then(() => res())
              .catch(() => rej());
          },
          (err: Error) => {
            rej(err);
          });
      }
    });
  }

  private finalizeUpdate(sub: Subscriber<string>) {
    this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(
      async data => {
        console.log("Finalizing update")
        sub.next("Finalizing update")
        await this.storage.setKey<AudioMetadata>(StorageKeys.CurrentMetadata, data);
        await this.storage.setKey<string>(StorageKeys.Version, data.Version);
        console.log("Finalized update")
        sub.next("Updated!")
        sub.complete();
      },
      async err => {
        this.completeWithError(sub, "Update failed!");
      });
  }

  private isStageMediaReady(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(
        data => {
          Promise.all(data.Audio.map(a => this.storage.checkKey(StorageKeys.MakeMediaKey(a.id)))).then(keys => {
            resolve(keys.reduce((curr, nxt) => curr && nxt, true));
          })
            .catch(err => {
              reject(err);
            })
        },
        err => {
          reject(err);
        })
    })
  }

  private completeWithError(sub: Subscriber<string>, msg: string) {
    sub.next(msg);
    sub.complete();
  }
}
