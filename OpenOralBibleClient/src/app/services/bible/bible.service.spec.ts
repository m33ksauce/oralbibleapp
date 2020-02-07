import { TestBed } from '@angular/core/testing';
import { BibleService } from './bible.service';
import { DisplayItem } from '../../models/DisplayItem';
import * as bibleData from './bibleData.json';
import { Category } from 'src/app/models/Category';

describe('Bible Service', () => {
  describe('Given a json database with categories', () => {
    beforeEach(() => TestBed.configureTestingModule({}));
    var database = {'categories': [
      {'name': 'A', 'subcategories': [], 'backgroundURI': ""},
      {'name': 'B', 'subcategories': [], 'backgroundURI': ""},
      {'name': 'C', 'subcategories': [], 'backgroundURI': ""},
      {'name': 'D', 'subcategories': [], 'backgroundURI': ""}
    ]};

    it('should load the database', () => {
      const service: BibleService = TestBed.get(BibleService);
      var status: boolean = service.load(database);

      expect(status).toBeTruthy();
    })

    describe('When getCategories is called', () => {
      it('should return the 3 categories', () => {
        const service: BibleService = TestBed.get(BibleService);
        service.load(database);

        var categories: Array<Category> = service.getAvailableCategories()

        expect(categories.length).toBe(database['categories'].length)
        expect(categories).toEqual(<Array<Category>>database.categories)
      })
    })
  })  
})