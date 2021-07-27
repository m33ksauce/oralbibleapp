import { Injectable } from '@angular/core';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import * as metadata from 'sample_data/metadata.json';

@Injectable({
  providedIn: 'root'
})
export class MetadataProviderService {
  data: AudioMetadata = {
    "Categories": metadata.Categories,
    "Audio": metadata.Audio
  } as AudioMetadata;
  
  constructor() { }

  getRawMetadata(): AudioMetadata {
    return this.data;
  }
}
