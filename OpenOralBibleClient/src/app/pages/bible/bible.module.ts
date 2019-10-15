import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BiblePage } from './bible.page';

import { BiblePageRoutingModule } from './bible.router.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    BiblePageRoutingModule
  ],
  declarations: [BiblePage]
})
export class BiblePageModule {}
