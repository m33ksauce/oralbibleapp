import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { StorageService } from '../Storage/storage.service';
import { UpdaterService } from './updater.service';

describe('UpdaterService', () => {
  let service: UpdaterService;
  const storageSpy = jasmine.createSpyObj('StorageService', ['getKey', 'setKey']);
  const httpSpy = jasmine.createSpyObj('HttpClient', ['get']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UpdaterService,
        { provide: StorageService, useValue: storageSpy },
        { provide: HttpClient, useValue: httpSpy },
      ],
    });
    service = TestBed.inject(UpdaterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
