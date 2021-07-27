import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { DatabaseService } from './services/Database/database.service';

import { Storage } from '@ionic/storage';
import { MetadataProviderService } from './services/MetadataProvider/metadata-provider.service';

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
    private storage: Storage,
    private metadata: MetadataProviderService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(async () => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.initializeDB();
    });
  }

  initializeDB() {
    this.storage.set("app-name", "Yetfa Bible");
    this.storage.set("media-metadata", this.metadata.getRawMetadata());
  }
}
