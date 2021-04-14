import { Injectable } from '@angular/core';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import * as metadata from 'sample_data/metadata.new.json';

@Injectable({
  providedIn: 'root'
})
export class MetadataProviderService {

  constructor() { }

  getRawMetadata(): AudioMetadata {
    return metadata as AudioMetadata;
  }
}
