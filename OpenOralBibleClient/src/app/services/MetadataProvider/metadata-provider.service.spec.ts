import { TestBed } from '@angular/core/testing';

import { MetadataProviderService } from './metadata-provider.service';

describe('MetadataProviderService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MetadataProviderService = TestBed.get(MetadataProviderService);
    expect(service).toBeTruthy();
  });
});
