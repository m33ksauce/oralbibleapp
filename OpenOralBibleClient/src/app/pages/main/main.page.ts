import { Component, OnInit } from '@angular/core';
import { DatabaseService } from 'src/app/services/Database/database.service';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  _dbService: DatabaseService;
  AppName: string = "Bible App";

  constructor(public storage: Storage) {}

  ngOnInit() {
    this.storage.get('app-name').then(data => this.AppName = data);
  }

}
