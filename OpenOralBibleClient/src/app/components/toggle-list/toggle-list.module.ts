import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ToggleListComponent } from './toggle-list.component';

@NgModule({
  declarations: [ToggleListComponent],
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [ToggleListComponent]
})
export class ToggleListModule { }
