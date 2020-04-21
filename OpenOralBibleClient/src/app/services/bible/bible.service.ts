import { Injectable } from '@angular/core';
import { Category } from '../../models/Category';
import { BibleSchema } from '../../models/BibleSchema';

@Injectable({
  providedIn: 'root'
})

export class BibleService {
  getAvailableSections(): Object[] {
    return ["Scripture", "Stories"]
  }
  private bible: BibleSchema;

  constructor() {}

  Load(data: Object) {
    //Stub for loading a translation
    this.bible = data as BibleSchema;
    return true;
  }

  getAvailableCategories(): Array<Category> { 
    return this.bible.categories
  }

}
