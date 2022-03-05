import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import bson from 'bson';
import { Observable, Subscriber } from 'rxjs';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { StorageKeys } from './storageKeys';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private isReady = false;

  constructor(
    private _storage: Storage,
    protected httpClient: HttpClient) 
  {
    this._storage.create().then(() => this.initializeDB())
  }

  private async initializeDB() {
    return this._storage.keys().then((keys) => {
      if (keys.find(k => k == StorageKeys.Version) == undefined) {
        console.log("db not initializing");
        return this.seedDatabase();
      }

      console.log("db already initialized");
      this.isReady = true;
    });
  }

  private async seedDatabase() {
    return this.httpClient.get('sample_data/bundle.obd', {"responseType": "arraybuffer"})
      .subscribe(data => {
        var readyActions = [];
        var bundle = bson.deserialize(data) as MediaBundle;
        readyActions.push(this._storage.set(StorageKeys.CurrentMetadata, bundle.Metadata));
        readyActions.push(this._storage.set(StorageKeys.Version, bundle.Metadata.Version))
        for (var m of bundle.Media) {
          readyActions.push(this._storage.set(`media-${m.target}`, m.data))
        }
        Promise.all(readyActions).then(() => this.isReady = true);
      })
  }

  public getKey(key: string) {
    return new Observable(sub => {
      this.getKeyWhenReady(key, sub);
    });
  }

  private getKeyWhenReady(key: string, sub: Subscriber<any>) {
    if (this.isReady) return this._storage.get(key).then((val) => sub.next(val));
    setTimeout(() => {
      this.getKeyWhenReady(key, sub);
    }, 100);
  } 

  public async setKey(key: string, val: any) {
    return this._storage.set(key, val);
  }

  private setKeyWhenReady(key: string, val: any, resolve) {
    if (this.isReady) return this._storage.set(key, val).then(resolve);
    setTimeout(() => {
      this.setKeyWhenReady(key, val, resolve)
    }, 100);
  }
}

class MediaBundle {
  public Metadata: AudioMetadata;
  public Media: AudioMedia[];

  constructor() {
      this.Metadata = { Version: undefined };
      this.Media = new Array<AudioMedia>()
  }
}

interface AudioMedia {
  target: string
  data: ArrayBuffer;
}
