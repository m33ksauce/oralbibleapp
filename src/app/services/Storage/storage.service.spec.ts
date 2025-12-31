import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import bson from 'bson';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from './storage.service';
import { StorageKeys } from './storageKeys';

describe('StorageService', () => {
  const storageSpy = 
    jasmine.createSpyObj('Storage', ['create', 'keys', 'get', 'set']);
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {provide: Storage, useValue: storageSpy},
        {provide: HttpClient, useValue: httpClientSpy},
      ]
    });
  });

  it('should be created', () => {
    //Arrange
    var testDoc = {
      Metadata: {},
      Media: {},
    }
    httpClientSpy.get.and.returnValue(bson.serialize(testDoc));
    storageSpy.create.and.callFake(() => Promise.resolve());
    storageSpy.set.and.callFake(() => Promise.resolve());
    storageSpy.keys.and.returnValue([StorageKeys.Version]);

    // Act
    service = TestBed.inject(StorageService);

    // Assert
    expect(service).toBeTruthy();
  });
});
