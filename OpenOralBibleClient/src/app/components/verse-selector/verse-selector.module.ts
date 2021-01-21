import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { VerseSelectorComponent } from './verse-selector.component';
import { VerseItemComponentModule } from 'src/app/components/verse-item/verse-item.module';

@NgModule({
  declarations: [VerseSelectorComponent],
  imports: [
    IonicModule,
    CommonModule,
    VerseItemComponentModule,
  ],
  exports: [VerseSelectorComponent]
})
export class VerseSelectorComponentModule { }
