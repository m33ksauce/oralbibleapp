import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'toggle-list',
  templateUrl: './toggle-list.component.html',
  styleUrls: ['./toggle-list.component.scss'],
})
export class ToggleListComponent implements OnInit {
  @Input() label="";
  @Input() items=[];

  constructor() { }

  ngOnInit() {
    
  }

}
