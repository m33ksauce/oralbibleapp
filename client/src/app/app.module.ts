import { importProvidersFrom, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { Drivers } from '@ionic/storage';
import { IonicStorageModule } from '@ionic/storage-angular';
import { StorageService } from './services/Storage/storage.service';

@NgModule({ 
    declarations: [AppComponent],
    bootstrap: [AppComponent], 
    imports: [
        BrowserModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        FontAwesomeModule],
    providers: [
        StatusBar,
        SplashScreen,
        importProvidersFrom(IonicStorageModule.forRoot({
            name: '__obadb',
            driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage]
        })),
        StorageService,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideHttpClient(withInterceptorsFromDi()),
    ] })
export class AppModule {}
