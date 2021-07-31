import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  AppName: string = "Bible App";

  constructor(public storage: Storage) {
    this.storage.get('app-name').then(data => this.AppName = data);
  }

  ngOnInit() {}

}
