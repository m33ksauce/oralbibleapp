import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { StorageService } from 'src/app/services/Storage/storage.service';
import { StorageKeys } from 'src/app/services/Storage/storageKeys';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  AppName: string = "Bible App";

  constructor(public storage: StorageService) {
    this.storage.getKey(StorageKeys.AppName).subscribe(data => this.AppName = data as string);
  }

  ngOnInit() {}

}
