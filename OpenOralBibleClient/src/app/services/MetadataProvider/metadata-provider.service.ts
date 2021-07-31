import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { Storage } from '@ionic/storage-angular';
import * as bson from 'bson';

@Injectable({
  providedIn: 'root'
})

export class MetadataProviderService {
  
  constructor(private storage: Storage, protected httpClient: HttpClient) { }

  getRawMetadata(): AudioMetadata {
    return this.storage.get("current-metadata") as AudioMetadata;
  }

  loadMetadata() {
    var data: MediaBundle;
    this.httpClient.get('sample_data/bundle.obd', {"responseType": "arraybuffer"}).subscribe(d => {
      data = bson.deserialize(d) as MediaBundle;
      this.storage.set("current-metadata", data.Metadata);
      data.Media.forEach(d => {
        this.storage.set(d.target, d.data);
      })
    })
  }
}

class MediaBundle {
  public Metadata: AudioMetadata;
  public Media: AudioMedia[];

  constructor() {
      this.Metadata = {};
      this.Media = new Array<AudioMedia>()
  }
}

interface AudioMedia {
  target: string
  data: ArrayBuffer;
}
