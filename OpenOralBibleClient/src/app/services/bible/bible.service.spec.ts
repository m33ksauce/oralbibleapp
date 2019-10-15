import { TestBed } from '@angular/core/testing';
import { BibleService } from './bible.service';
import { DisplayItem } from '../../models/DisplayItem';
import * as bibleData from './bibleData.json';

describe('BibleService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BibleService = TestBed.get(BibleService);
    expect(service).toBeTruthy();
  });

  it('should return available categories', () => {
    const service: BibleService = TestBed.get(BibleService);
    var expectedCats: Array<DisplayItem> = [
      new DisplayItem("Old Testament"),
      new DisplayItem("New Testament"), 
      new DisplayItem("Stories")
    ]
    expect(service).toBe(expectedCats)

  });
});
