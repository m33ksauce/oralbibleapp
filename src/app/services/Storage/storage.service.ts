import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { ReplaySubject, firstValueFrom } from 'rxjs';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { StorageKeys } from './storageKeys';

@Injectable({
  providedIn: 'root'
})

export class StorageService {
  private isReady = false;
  private observers = new Map<string, ReplaySubject<unknown>>();

  constructor(
    private _storage: Storage,
    protected httpClient: HttpClient) {
    this._storage.create().then(() => this.initializeDB())
  }

  private async initializeDB() {
    // TODO:
    // Emit an error for the dialog if we fail
    // any of these steps
    return this._storage.keys().then((keys) => {
      if (keys.find(k => k == StorageKeys.Version) == undefined) {
        console.log("DB not found - initializing from local metadata");
        return this.seedDatabase();
      }

      console.log("DB already initialized");
      this.isReady = true;
    });
  }

  private async seedDatabase() {
    try {
      const metadata = await firstValueFrom(this.httpClient.get<AudioMetadata>('media/metadata.json'));
      const readyActions: Promise<unknown>[] = [];
      readyActions.push(this._storage.set(StorageKeys.CurrentMetadata, metadata));
      readyActions.push(this._storage.set(StorageKeys.Version, metadata.Version));

      if (metadata.Audio && metadata.Audio.length > 0) {
        for (const audio of metadata.Audio) {
          const audioPromise = firstValueFrom(
            this.httpClient.get(`media/${audio.file}`, { responseType: 'arraybuffer' })
          )
            .then((arrayBuffer) => this._storage.set(`media-${audio.id}`, arrayBuffer))
            .catch((err) => console.log(`Failed to load audio file ${audio.file}: ${err}`));
          readyActions.push(audioPromise);
        }
      }

      await Promise.all(readyActions);
      this.isReady = true;
    } catch (err) {
      console.log(`Failed to seed DB: ${err}`);
    }
  }

  public getKey<T>(key: string): ReplaySubject<T> {
    if (!this.observers.has(key)) this.observers.set(key, new ReplaySubject<T>(0));
    this.getKeyWhenReady(key, this.observers.get(key));
    return this.observers.get(key) as ReplaySubject<T>;
  }

  public checkKey(key: string): Promise<boolean> {
    return this._storage.keys()
      .then(keys => keys.includes(key))
      .catch(() => {
        console.log(`Check key failed for key: ${key}`)
        return false;
      });
  }

  private getKeyWhenReady<T>(key: string, sub: ReplaySubject<T>) {
    if (this.isReady) return this._storage.get(key)
      .then((val) => {
        if (val == null) {
          sub.error(`Get key failed for key: ${key}`)
          throw new Error();
        }
        sub.next(val as T)
      })
      .catch(() => console.log(`Get key failed for key: ${key}`));
    setTimeout(() => {
      this.getKeyWhenReady<T>(key, sub);
    }, 100);
  }

  public async setKey<T>(key: string, val: T) {
    if (this.observers.has(key)) {
      this.observers.get(key).next(val);
    }
    return this._storage.set(key, val)
      .then(() => console.log(`Set key succeeded for key: ${key}`))
      .catch(() => console.log(`Set key failed for key: ${key}`));
  }
}

// MediaBundle and AudioMedia interfaces removed - no longer using BSON bundle
