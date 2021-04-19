import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { MainPageRoutingModule } from './main-routing.module';

import { MainPage } from './main.page';

import { PlayerComponentModule } from 'src/app/components/player/player.module';
import { MediaSelectorComponentModule } from 'src/app/components/media-selector/media-selector.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MainPageRoutingModule,
    PlayerComponentModule,
    MediaSelectorComponentModule
  ],
  declarations: [MainPage]
})
export class MainPageModule {}
