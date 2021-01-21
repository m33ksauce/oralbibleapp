import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'verse-selector',
  templateUrl: './verse-selector.component.html',
  styleUrls: ['./verse-selector.component.scss'],
})
export class VerseSelectorComponent implements OnInit {
  verses: Array<Object>;
  constructor() { 
    this.verses = [
      {title: "Luke 1:1"},
      {title: "Luke 1:2"},
    ];
  }

  ngOnInit() {}

}