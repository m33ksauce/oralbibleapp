import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { StorageService } from './services/Storage/storage.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private storage: StorageService,
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async() => {
      this.statusBar.styleDefault();
      this.initializeDB().then(() => this.splashScreen.hide());
    });
  }

  initializeDB() {
    return this.storage.setKey<string>("app-name", environment.appName);
  }
}
