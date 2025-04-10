import { InjectionToken, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { StorageService } from './services/Storage/storage.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({ declarations: [AppComponent],
    entryComponents: [],
    bootstrap: [AppComponent], imports: [BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        IonicStorageModule.forRoot({
            name: '__obadb',
            driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
        }),
        FontAwesomeModule], providers: [
        StatusBar,
        SplashScreen,
        StorageService,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
