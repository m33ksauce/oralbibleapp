import { TestBed } from '@angular/core/testing';
import { BibleService } from './bible.service';
import * as bibleData from './bibleData.json';
import { Category } from 'src/app/models/Category';

// describe('Bible Service', () => {
//   describe('Given a json database with categories', () => {
//     beforeEach(() => TestBed.configureTestingModule({}));
//     var databaseWithCatgories = {'categories': [
//       {'name': 'A', 'subcategories': [], 'backgroundURI': ""},
//       {'name': 'B', 'subcategories': [], 'backgroundURI': ""},
//       {'name': 'C', 'subcategories': [], 'backgroundURI': ""},
//       {'name': 'D', 'subcategories': [], 'backgroundURI': ""}
//     ]};
//     var databaseWithBooks = {'categories': [
//       {'name': 'A', 'subcategories': [
//         {'name': 'A1', 'subcategories': [], 'backgroundURI': ''}
//       ], 'backgroundURI': ''}
//     ]}

//     it('should load the database', () => {
//       const service: BibleService = TestBed.get(BibleService);
//       var status: boolean = service.Load(databaseWithCatgories);

//       expect(status).toBeTruthy();
//     })

//     describe('When getCategories is called', () => {
//       it('should return the categories', () => {
//         const service: BibleService = TestBed.get(BibleService);
//         service.Load(databaseWithCatgories);

//         var categories: Array<Category> = service.getAvailableCategories()

//         expect(categories.length).toBe(databaseWithCatgories['categories'].length)
//         expect(categories).toEqual(<Array<Category>>databaseWithCatgories.categories)
//       })
//     })

//     describe('When getBooks is called', () => {
//       it('should return the books for that category', () => {
//         const service: BibleService = TestBed.get(BibleService);
//         service.Load(databaseWithBooks);
//         var firstCat = databaseWithBooks.categories.pop();

//         var books: Array<Subcategory> = service.getAvailableBooks(firstCat);

//         expect(books.length).toBe(firstCat.subcategories.length)
//       })
//     })
//   })  
// })