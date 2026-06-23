import { HttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { storageServiceSpy } from 'src/test/storageSpy';
import { UpdaterService } from './updater.service';

describe('UpdaterService', () => {
  const httpClientSpy = jasmine.createSpyObj('HttpClient', ['get']);

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HttpClient, useValue: httpClientSpy },
        { provide: UpdaterService, useFactory: () => new UpdaterService(storageServiceSpy as any, httpClientSpy) },
      ],
    });
  });

  it('should be created', () => {
    const service = TestBed.inject(UpdaterService);
    expect(service).toBeTruthy();
  });
});
