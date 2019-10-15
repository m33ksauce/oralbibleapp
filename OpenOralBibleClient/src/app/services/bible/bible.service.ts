import { Injectable } from '@angular/core';
import { Category, Subcategory } from '../../models/Category';
import { Book } from '../../models/Book';
import * as bibleData from './sampleProjectData.json';
import { DisplayItem } from '../../models/DisplayItem';

@Injectable({
  providedIn: 'root'
})

export class BibleService {
  private bible: Object;

  constructor() { this.loadTranslation("Sample"); }

  getAvailable(target?: String) {
    var items = new Array<Object>();

    items.push({"id": "0", "displayName": "Old Testmanent", "imageURI": "/assets/ot-card.jpg"});

    return items;
  }

  parseBible(){};

  loadTranslation(name: String) {
    //Stub for loading a translation
    this.bible = bibleData;
  }

  getAvailableCategories(): Array<Object> { 
    return [
      {
        DisplayName: "Old Testament"
      },
      {
        DisplayName: "New Testament"
      },
      {
        DisplayName: "Stories"
      }
    ]
  }

  getAvailableBooks(cat: Category) {}

  getAvailableChapters() {}

  getAvailableVerses(book: Book) {}

  getAvailableStories() {}

}
