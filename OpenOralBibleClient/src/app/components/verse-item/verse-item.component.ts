import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'verse-item',
  templateUrl: './verse-item.component.html',
  styleUrls: ['./verse-item.component.scss'],
})

export class VerseItemComponent implements OnInit {
  @Input() title = "";
  @Input() target = "";
  constructor() { }

  ngOnInit() {}
  
}