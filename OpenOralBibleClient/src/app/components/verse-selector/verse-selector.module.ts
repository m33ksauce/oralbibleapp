import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { VerseSelectorComponent } from './verse-selector.component';
import { VerseItemComponentModule } from 'src/app/components/verse-item/verse-item.module';
import { ToggleListModule } from '../toggle-list/toggle-list.module';

@NgModule({
  declarations: [VerseSelectorComponent],
  imports: [
    IonicModule,
    CommonModule,
    VerseItemComponentModule,
    ToggleListModule,
  ],
  exports: [VerseSelectorComponent]
})
export class VerseSelectorComponentModule { }
