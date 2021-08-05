import { TestBed } from '@angular/core/testing';
import { storageServiceSpy } from 'src/test/storageSpy';
import { StorageService } from '../Storage/storage.service';

import { PlayerService } from './player.service';

describe('PlayerService', () => {
  const storageSpy = storageServiceSpy;

  beforeEach(() => TestBed.configureTestingModule({
    providers: [{provide: StorageService, useValue: storageSpy}]
  }));

  it('should be created', () => {
    const service: PlayerService = TestBed.get(PlayerService);
    expect(service).toBeTruthy();
  });
});
