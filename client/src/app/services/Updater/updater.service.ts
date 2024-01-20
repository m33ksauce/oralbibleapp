import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MetadataService } from '../Metadata/metadata.service';
import { StorageService } from '../Storage/storage.service';
import { StorageKeys } from '../Storage/storageKeys';
import { UpdateMethods, UpdateProvider } from './update-provider';
import { WebUpdateProvider } from './web-update-provider';
import * as semver from 'semver';
import { AudioMetadata, AudioFile } from 'src/app/interfaces/audio-metadata';
import { defer, from, observable, Observable } from 'rxjs';
import { finalize, first, map, mergeAll } from 'rxjs/operators';
import { Buffer } from "buffer";
import { UpdateStatus, UpdateStatusProvider } from './update-status';

@Injectable({
  providedIn: 'root'
})

export class UpdaterService extends UpdateStatusProvider {
  private provider: UpdateProvider;

  constructor(
    public storage: StorageService,
    private http: HttpClient) {
    super();
  }

  public GetUpdater(method: UpdateMethods) {
    if (method === UpdateMethods.WEB) {
      this.provider = new WebUpdateProvider(this.http);
    }
  }

  public UpdateWithStatus(): Observable<UpdateStatus> {
    this.stageUpdate()
    return this.SubscribeStatus()
      .pipe(map(([s, _]) => s));
  }

  private stageUpdate() {
      this.provider.GetMetadata().pipe(first()).subscribe(
        (data) => {
          let newVersion = data.Version;
          this.storage.getKey<string>(StorageKeys.Version).pipe(first()).subscribe(currentVersion => {
            if (!semver.valid(newVersion)) {
              console.log("Couldn't update - version not valid")
              this.SetStatus(UpdateStatus.FAILED, "Couldn't update - new version not valid")
              return
            };


            if (semver.lt(newVersion, currentVersion)) {
              console.log("Couldn't update - new version older than current version");
              this.SetStatus(UpdateStatus.SUCCEEDED, "No update available")
              return
            }

            this.storage.setKey<AudioMetadata>(StorageKeys.StageMetadata, data).then(async () => {
              this.syncStageMedia(data)
            })
              .catch((err) => {
                console.log(`Failed to stage metadata: ${err}`);
                this.SetStatus(UpdateStatus.FAILED, "Failed to stage metadata")
              })
          })
        },
        (err: Error) => {
          console.log(`Failed to get metadata: ${err}`);
          this.SetStatus(UpdateStatus.FAILED, "Failed to get metadata")
        });
  }

  private async syncStageMedia(md: AudioMetadata) {
    console.log("Starting update sync")
    this.SetStatus(UpdateStatus.UPDATING, "Starting update")
    const audio = md.Audio;

    let obs = audio
      .map(item => defer(() => 
        this.syncMedia(item.id))
      );

    from(obs)
    .pipe(
      mergeAll(5),
      finalize(async () => {
        if (await this.isStageMediaReady) {
          console.log("Finished syncing")
              return this.finalizeUpdate();
        }
      }))
    .subscribe()
  }

  private syncMedia(id: string): Promise<void> {
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

  private finalizeUpdate() {
    this.storage.getKey<AudioMetadata>(StorageKeys.StageMetadata).pipe(first()).subscribe(
      async data => {
        console.log("Finalizing update")
        await this.storage.setKey<AudioMetadata>(StorageKeys.CurrentMetadata, data);
        await this.storage.setKey<string>(StorageKeys.Version, data.Version);
        console.log("Finalized update")
        this.SetStatus(UpdateStatus.SUCCEEDED, "Finalized")
      },
      async err => {
        this.SetStatus(UpdateStatus.FAILED, "Couldn't finalize")
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
}
