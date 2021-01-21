import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { VerseItemComponent } from './verse-item.component';

@NgModule({
  declarations: [VerseItemComponent],
  imports: [
    CommonModule,
  ],
  exports: [VerseItemComponent]
})
export class VerseItemComponentModule { }
