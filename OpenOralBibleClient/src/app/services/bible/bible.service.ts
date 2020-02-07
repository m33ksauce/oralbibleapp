import { Injectable } from '@angular/core';
import { Category, Subcategory } from '../../models/Category';
import { Book } from '../../models/Book';
import * as bibleData from './sampleProjectData.json';
import { BibleSchema } from '../../models/BibleSchema';

@Injectable({
  providedIn: 'root'
})

export class BibleService {
  private bible: BibleSchema;

  constructor() { this.load("Sample"); }

  getAvailable(target?: String) {
    var items = new Array<Object>();

    items.push({"id": "0", "displayName": "Old Testmanent", "imageURI": "/assets/ot-card.jpg"});

    return items;
  }

  parseBible(){};

  load(data: Object) {
    //Stub for loading a translation
    this.bible = data as BibleSchema;
    return true;
  }

  getAvailableCategories(): Array<Category> { 
    return this.bible.categories
  }

  getAvailableBooks(cat: Category) {}

  getAvailableChapters() {}

  getAvailableVerses(book: Book) {}

  getAvailableStories() {}

}
