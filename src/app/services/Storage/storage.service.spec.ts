import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
// BSON import removed - no longer using BSON bundle
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
    var testMetadata = {
      Version: '0.0.0',
      Categories: [],
      Audio: []
    }
    httpClientSpy.get.and.returnValue(Promise.resolve(testMetadata));
    storageSpy.create.and.callFake(() => Promise.resolve());
    storageSpy.set.and.callFake(() => Promise.resolve());
    storageSpy.keys.and.returnValue([StorageKeys.Version]);

    // Act
    service = TestBed.inject(StorageService);

    // Assert
    expect(service).toBeTruthy();
  });
});
