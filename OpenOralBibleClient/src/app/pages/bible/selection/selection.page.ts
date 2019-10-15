import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-selection',
  templateUrl: './selection.page.html',
  styleUrls: ['./selection.page.scss'],
})
export class SelectionPage implements OnInit {

  constructor(public route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(
      params => console.log(params)
    )
  }

}
