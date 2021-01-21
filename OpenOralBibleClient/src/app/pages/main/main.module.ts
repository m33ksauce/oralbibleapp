import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';

import { PlayerComponentModule } from 'src/app/components/player/player.module';
import { VerseSelectorComponentModule } from 'src/app/components/verse-selector/verse-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    PlayerComponentModule,
    VerseSelectorComponentModule
  ],
  declarations: [MainPage]
})
export class MainPageModule {}
