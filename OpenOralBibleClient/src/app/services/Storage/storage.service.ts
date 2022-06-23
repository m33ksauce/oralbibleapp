import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import bson from 'bson';
import { AsyncSubject, BehaviorSubject, Observable, ReplaySubject, Subject, Subscriber } from 'rxjs';
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

  // public getKey<T>(key: string): Observable<T> {
  //   return new Observable<T>(sub => {
  //     this.getKeyWhenReady<T>(key, sub);
  //   });
  // }

  public getKey<T>(key: string): ReplaySubject<T> {
    if (!this.observers.has(key)) this.observers.set(key, new ReplaySubject<T>(0));
    this.getKeyWhenReady(key, this.observers.get(key));
    return this.observers.get(key) as ReplaySubject<T>;
  }

  public checkKey(key: string): Promise<boolean> {
    return this._storage.keys().then(keys => keys.includes(key))
  }

  private getKeyWhenReady<T>(key: string, sub: ReplaySubject<T>) {
    if (this.isReady) return this._storage.get(key).then((val) => sub.next(val as T));
    setTimeout(() => {
      this.getKeyWhenReady<T>(key, sub);
    }, 100);
  }

  public async setKey<T>(key: string, val: T) {
    if(this.observers.has(key)) {
      this.observers.get(key).next(val);
    }
    return this._storage.set(key, val);
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
