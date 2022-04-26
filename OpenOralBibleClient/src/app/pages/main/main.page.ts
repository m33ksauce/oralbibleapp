import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { StorageService } from 'src/app/services/Storage/storage.service';
import { StorageKeys } from 'src/app/services/Storage/storageKeys';
import { UpdatePage } from '../update/update.page';

@Component({
  selector: 'app-main',
  templateUrl: './main.page.html',
  styleUrls: ['./main.page.scss'],
})
export class MainPage implements OnInit {
  AppName: string = "Bible App";

  constructor(
    public storage: StorageService,
    public navCtrl: NavController) {
    this.storage.getKey<string>(StorageKeys.AppName).subscribe(data => this.AppName = data as string);
  }

  ngOnInit() {}

  navigateToSettings() {
    this.navCtrl.navigateForward("/update");
  }

}
