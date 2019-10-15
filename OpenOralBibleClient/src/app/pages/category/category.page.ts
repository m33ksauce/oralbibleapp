import { Component } from '@angular/core';
import { Book } from 'src/app/models/Book';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category',
  templateUrl: './category.page.html',
  styleUrls: ['./category.page.scss'],
})
export class CategoryPage {
  categories: Array<Book>;

  constructor(private router: Router) {
    this.categories = new Array<Book>();
    this.categories.push(new Book("Matthew"));
    this.categories.push(new Book("Luke"));
    this.categories.push(new Book("Philemon"));
  }

  launchPlayer() {
    console.log("Launching player...");
    this.router.navigate(["tabs/player"]);
  }
}
