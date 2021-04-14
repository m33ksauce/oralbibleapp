import { TestBed } from '@angular/core/testing';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { Category } from 'src/app/models/Category';
import { MediaListItem, MediaType } from 'src/app/models/MediaListItem';
import { MetadataProviderService } from '../MetadataProvider/metadata-provider.service';

import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  var metadataProviderSpy = jasmine.createSpyObj('MetadataProviderService', ['getRawMetadata']);

  beforeEach(() => TestBed.configureTestingModule({
    providers: [{provide: MetadataProviderService, useValue: metadataProviderSpy}]
  }));

  afterEach(() => {
    metadataProviderSpy.getRawMetadata.calls.reset();
  })

  describe('getAvailableMedia', () => {
    it('should parse metadata', () => {
      metadataProviderSpy.getRawMetadata.and.returnValue({});

      const service: MetadataService = TestBed.get(MetadataService);

      expect(metadataProviderSpy.getRawMetadata.calls.count()).toBe(1);
    });

    it('should parse categories', () => {
      metadataProviderSpy.getRawMetadata.and.returnValue({
        "Categories": [
          { "name": "categoryName", "type": MediaType.Category, "contents": [] }
        ]
      });

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe(media => {
        expect(media.length).toBeGreaterThan(0);
        var category = media.shift();
        verifyCategory(category, "categoryName");
      });
    });

    it('should parse multiple categories', () => {
      metadataProviderSpy.getRawMetadata.and.returnValue({
        "Categories": [
          { "name": "categoryName", "type": MediaType.Category, "contents": [] },
          { "name": "categoryName2", "type": MediaType.Category, "contents": [] }
        ]
      });

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe(media => {
        expect(media.length).toBeGreaterThan(0);
        verifyCategory(media.shift(), "categoryName");
        verifyCategory(media.shift(), "categoryName2");
      });
    });

    it('should parse categories with child categories', () => {
      metadataProviderSpy.getRawMetadata.and.returnValue({
        "Categories": [
          { "name": "categoryName", "type": MediaType.Category, "contents": [
            { "name": "categoryName2", "type": MediaType.Category, "contents": [] }
          ] },
        ]
      });

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe(media => {
        expect(media.length).toBe(1);
        var category = media.shift();
        verifyCategory(category, "categoryName");
      })
    })
  });
});

const verifyCategory = (cat: MediaListItem, name: string) => {
  expect(cat.name).toBe(name);
  expect(cat.type).toBe(MediaType.Category);
}