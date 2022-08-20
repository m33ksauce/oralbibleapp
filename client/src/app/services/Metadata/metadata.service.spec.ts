import { TestBed } from '@angular/core/testing';
import { AudioMetadata } from 'src/app/interfaces/audio-metadata';
import { Category } from 'src/app/models/Category';
import { MediaListItem, MediaType } from 'src/app/models/MediaListItem';
import { storageServiceSpy, WrapObservable } from 'src/test/storageSpy';
import { StorageService } from '../Storage/storage.service';

import { MetadataService } from './metadata.service';

describe('MetadataService', () => {
  const metadataProviderSpy = storageServiceSpy;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{provide: StorageService, useValue: storageServiceSpy}]
    });
    storageServiceSpy.getKey.calls.reset();
  });

  describe('getAvailableMedia', () => {

    beforeEach(() => storageServiceSpy.getKey.calls.reset());

    it('should parse metadata', () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable(WrapObservable({})));

      const service: MetadataService = TestBed.get(MetadataService);

      expect(storageServiceSpy.getKey.calls.count()).toBe(1);
    });

    it('should parse categories', () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "categoryName", "type": MediaType.Category, "children": [] }
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe(media => {
        expect(media.length).toBeGreaterThan(0);
        var category = media.shift();
        verifyCategory(category, "categoryName");
      });
    });

    it('should parse multiple categories', () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "categoryName", "type": MediaType.Category, "children": [] },
          { "name": "categoryName2", "type": MediaType.Category, "children": [] }
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe(media => {
        expect(media.length).toBeGreaterThan(0);
        verifyCategory(media.shift(), "categoryName");
        verifyCategory(media.shift(), "categoryName2");
      });
    });

    it('should parse categories with child categories', () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "categoryName", "type": MediaType.Category, "children": [
            { "name": "categoryName2", "type": MediaType.Category, "children": [] }
          ] },
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe(media => {
        expect(media.length).toBe(1);
        var category = media.shift();
        verifyCategory(category, "categoryName");
        expect(category.hasChildren()).toBeTruthy();
        var child = category.children.shift();
        verifyCategory(child, "categoryName2");
      });
    });

    it('should parse categories with multiple children', () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "categoryName", "type": MediaType.Category, "children": [
            { "name": "categoryName2", "type": MediaType.Category, "children": [] },
            { "name": "categoryName3", "type": MediaType.Category, "children": [] }
          ] },
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);
      
      service.getAvailableMedia().subscribe(media => {
        expect(media.length).toBe(1);
        var category = media.shift();
        verifyCategory(category, "categoryName");
        expect(category.hasChildren()).toBeTruthy();
        expect(category.children.length).toBeGreaterThan(1);
        var child = category.children.shift();
        verifyCategory(child, "categoryName2");
        var child2 = category.children.shift();
        verifyCategory(child2, "categoryName3");
      });
    });

    it('should parse audio', () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "audioName", "type": MediaType.Audio, "children": [], "audioTargetId": "target" }
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe(media => {
        expect(media.length).toBe(1);
        var audio = media.shift();
        verifyAudio(audio, "audioName", "target");
      });
    });

    it('should parse categories with child audio', () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "categoryName", "type": MediaType.Category, "children": [
            { "name": "audioName", "type": MediaType.Audio, "children": [], "audioTargetId": "target"}
          ]}
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe(media => {
        var cat = media.shift();
        verifyCategory(cat, "categoryName");
        expect(cat.hasChildren()).toBeTruthy();
        expect(cat.children.length).toBeGreaterThan(0);
        var child = cat.children.shift();
        verifyAudio(child, "audioName", "target");
      });
    });

    it('should parse complex metadata', () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "New Testament", "type": MediaType.Category, "children": [
            { "name": "Luke", "type": MediaType.Category, "children": [
              { "name": "Luke 1", "type": MediaType.Category, "children": [
                { "name": "Luke 1:1", "type": MediaType.Audio, "audioTargetId": "luke1_1.mp3" }
              ]}
            ]},
            { "name": "John", "type": MediaType.Category, "children": [] },
          ], }
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      service.getAvailableMedia().subscribe((media) => {
        var nt = media.shift();
        verifyCategory(nt, "New Testament");
        expect(nt.hasChildren()).toBeTruthy();
        expect(nt.children.length).toBe(2);

        var luke = nt.children.shift();
        verifyCategory(luke, "Luke");
        expect(luke.hasChildren()).toBeTruthy();

        var john = nt.children.shift();
        verifyCategory(john, "John");
        expect(john.hasChildren()).toBeFalsy();

        var luke1 = luke.children.shift();
        verifyCategory(luke1, "Luke 1");
        expect(luke1.hasChildren()).toBeTruthy();

        var luke1_1 = luke1.children.shift();
        verifyAudio(luke1_1, "Luke 1:1", "luke1_1.mp3");
      });
    })
  });

  describe('getAudioFromTarget', () => {

    beforeEach(() => storageServiceSpy.getKey.calls.reset());

    it('get file string from id', () => {
      const mockTargetId = "00000000-0000";    
      const mockFilePath = "path/to/thing";

      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Audio": [
          { "id": mockTargetId, "file": mockFilePath }
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      var file = service.getAudioFileFromTarget(mockTargetId);

      expect(file).toBe(mockFilePath);

    });
  });

  describe('getNextMedia', () => {

    beforeEach(() => storageServiceSpy.getKey.calls.reset());

    it('returns adjacent next', async () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "book", "type": MediaType.Category, "children": [
            { "name": "audioName1", "type": MediaType.Audio, "children": [], "audioTargetId": "target1" },
            { "name": "audioName2", "type": MediaType.Audio, "children": [], "audioTargetId": "target2" }
          ]},
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      var nxt = service.getNextMedia(0);
      
      expect(nxt).not.toBeUndefined();
      expect(nxt.audioTargetId).toBe("target2");
    });

    it('returns media from adjacent category', async () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "category1", "type": MediaType.Category, "children": [
            { "name": "audioName1", "type": MediaType.Audio, "children": [], "audioTargetId": "target3" }
          ]},
          { "name": "category1", "type": MediaType.Category, "children": [
            { "name": "audioName2", "type": MediaType.Audio, "children": [], "audioTargetId": "target4" }
          ]}
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      var nxt = service.getNextMedia(0);

      expect(nxt).not.toBeUndefined();
      expect(nxt.audioTargetId).toBe("target4");
    });
  });

  describe('getPrevMedia', () => {

    beforeEach(() => storageServiceSpy.getKey.calls.reset());

    it('returns adjacent previous', async () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "book", "type": MediaType.Category, "children": [
            { "name": "audioName1", "type": MediaType.Audio, "children": [], "audioTargetId": "target1" },
            { "name": "audioName2", "type": MediaType.Audio, "children": [], "audioTargetId": "target2" }
          ]},
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      var prev = service.getPrevMedia(1);

      expect(prev).not.toBeUndefined();
      expect(prev.audioTargetId).toBe("target1");
    });

    it('returns media from adjacent category', async () => {
      storageServiceSpy.getKey.and.returnValue(WrapObservable({
        "Categories": [
          { "name": "category1", "type": MediaType.Category, "children": [
            { "name": "audioName1", "type": MediaType.Audio, "children": [], "audioTargetId": "target3" }
          ]},
          { "name": "category1", "type": MediaType.Category, "children": [
            { "name": "audioName2", "type": MediaType.Audio, "children": [], "audioTargetId": "target4" }
          ]}
        ]
      }));

      const service: MetadataService = TestBed.get(MetadataService);

      var prev = service.getPrevMedia(1);

      expect(prev).not.toBeUndefined();
      expect(prev.audioTargetId).toBe("target3");
    });
  });
});

const verifyCategory = (media: MediaListItem, name: string) => {
  expect(media.name).toBe(name);
  expect(media.type).toBe(MediaType.Category);
}

const verifyAudio = (media: MediaListItem, name: string, target: string) => {
  expect(media.name).toBe(name);
  expect(media.type).toBe(MediaType.Audio);
  expect(media.audioTargetId).toBe(target);
}